import { Component, ViewChild } from '@angular/core';
import { NavParams, Item, ViewController, Slides } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import { Chart } from 'chart.js';
import { Subscription } from 'rxjs/Subscription';
import moment from 'moment';

/**
 * Generated class for the ModalStatisticsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'modal-statistics',
  templateUrl: 'modal-statistics.html'
})
export class ModalStatisticsComponent {
  
    @ViewChild(Slides) slides: Slides;

    student: Subscription;
    appointment: Subscription;

  text: string;
  date: any;
  academic: any;

  year: any;
  schoolYear:any;

  studentsEnrolled: any;
  studentNotEnrolled: any;

  //Months
  juneFinish: any;
  julyFinish: any;
  augustFinish: any;
  septemberFinish: any;
  octoberFinish: any;
  novemberFinish: any;
  decemberFinish: any;
  januaryFinish: any;
  februaryFinish: any;
  marchFinish: any;
  aprilFinish: any;
  mayFinish: any;

  //Months
  junePending: any;
  julyPending: any;
  augustPending: any;
  septemberPending: any;
  octoberPending: any;
  novemberPending: any;
  decemberPending: any;
  januaryPending: any;
  februaryPending: any;
  marchPending: any;
  aprilPending: any;
  mayPending: any;

  barChartFirst: any;
  barChartSecond: any;
  barChartSummer: any;
  pieChart: any;

  academicName

  constructor(public navParams: NavParams,
      public fireDatabase: AngularFireDatabase,
      public viewCtrl: ViewController,
      public db: DatabaseProvider) {
        this.intialize();
  }

  async intialize() {
    try {
      this.academic = this.navParams.get("id");
        let date = this.navParams.get("date");
        this.date = new Date(date);
  
        this.year = this.date.getFullYear();
        this.schoolYear = this.year + " - " + (this.year+1);
  
        console.log("School Year: ", this.schoolYear);
  
      // this.verifyDate(date);
        this.fetchAllAppointments();
        this.fetchAllStudents();
        this.fetchAcademicName();

    } catch {

    }
  }

  fetchAllAppointments() {
    let list = this.fireDatabase.list<Item>("appointment");
    let item = list.valueChanges();

    this.appointment = item.subscribe(async appointments => {
      await this.fetchFinishYear(appointments);
      await this.fetchAcceptYear(appointments);

      this.loadBarAppointmentsFirstSemester();
      this.loadBarAppointmentsSecondSemester();
      this.loadBarAppointmentsSummer();


      setTimeout(async () => {
        await this.setSlide();
      }, 300);
    })
  }

  async setSlide() {
    let index;
    let datetime = new Date(moment().format());
    let semester = datetime.getMonth();
    
    let year;

    //Verify's the year
    if(semester.toString().match(/^(5|6|7|8|9|10|11)$/)) {
      year = datetime.getFullYear();
    }
    if (semester.toString().match(/^(0|1|2|3|4)$/)) {
      datetime.setFullYear(datetime.getFullYear()-1);
      year = datetime.getFullYear();
    }

    console.log("Year: ", year, " ? ", this.year);
    
    if(year === this.year) {
      let month = this.date.getMonth();
  
      if(month.toString().match(/^(5|6|7|8|9)$/)) {
        console.log("First Semester");
        index = 0;
      }else if (month.toString().match(/^(0|1|2|10|11)$/)) {
        console.log("Second Semester");
        index = 1;
      }else {
        console.log("Summer");
        index = 2;
      }
    } else index = 0;


    await this.slides.slideTo(index, 500);
  }

  fetchAllStudents(){
      let list = this.fireDatabase.list<Item>("student");
      let item = list.valueChanges();

      this.student = item.subscribe(async students => {
        this.studentsEnrolled = await this.db.fetchAllStudentsOfUnit(students, this.academic, this.year, "Enrolled");
        this.studentNotEnrolled = await this.db.fetchAllStudentsOfUnit(students, this.academic, this.year, "Not Enrolled");

        console.log("Students: ", this.studentsEnrolled, " ? ", this.studentNotEnrolled);
        if(this.studentsEnrolled === 0 && this.studentNotEnrolled === 0) await this.loadNoStudent();
        else await this.loadPieStudents();
      })
  }

  async fetchAcademicName() {
      let academics = await this.db.fetchAllNodesByTableInDatabase("academic");

      academics.forEach(academic => {
          if(academic["acID"] === this.academic) this.academicName = academic["acName"];
      })
  }

  async fetchFinishYear(appointments) {
    this.juneFinish = await this.db.fetchAppointmentFinishOfMonth(5, this.year, appointments, this.academic);
    this.julyFinish = await this.db.fetchAppointmentFinishOfMonth(6, this.year, appointments, this.academic);
    this.augustFinish = await this.db.fetchAppointmentFinishOfMonth(7, this.year, appointments, this.academic);
    this.septemberFinish = await this.db.fetchAppointmentFinishOfMonth(8, this.year, appointments, this.academic);
    this.octoberFinish = await this.db.fetchAppointmentFinishOfMonth(9, this.year, appointments, this.academic);
    this.novemberFinish = await this.db.fetchAppointmentFinishOfMonth(10, this.year, appointments, this.academic);
    this.decemberFinish = await this.db.fetchAppointmentFinishOfMonth(11, this.year, appointments, this.academic);
    this.januaryFinish = await this.db.fetchAppointmentFinishOfMonth(0, this.year+1, appointments, this.academic);
    this.februaryFinish = await this.db.fetchAppointmentFinishOfMonth(1, this.year+1, appointments, this.academic);
    this.marchFinish = await this.db.fetchAppointmentFinishOfMonth(2, this.year+1, appointments, this.academic);
    this.aprilFinish = await this.db.fetchAppointmentFinishOfMonth(3, this.year+1, appointments, this.academic);
    this.mayFinish = await this.db.fetchAppointmentFinishOfMonth(4, this.year+1, appointments, this.academic);
  }

  async fetchAcceptYear(appointments) {
    this.junePending = await this.db.fetchAppointmentAcceptOfMonth(5, this.year, appointments, this.academic);
    this.julyPending = await this.db.fetchAppointmentAcceptOfMonth(6, this.year, appointments, this.academic);
    this.augustPending = await this.db.fetchAppointmentAcceptOfMonth(7, this.year, appointments, this.academic);
    this.septemberPending = await this.db.fetchAppointmentAcceptOfMonth(8, this.year, appointments, this.academic);
    this.octoberPending = await this.db.fetchAppointmentAcceptOfMonth(9, this.year, appointments, this.academic);
    this.novemberPending = await this.db.fetchAppointmentAcceptOfMonth(10, this.year, appointments, this.academic);
    this.decemberPending = await this.db.fetchAppointmentAcceptOfMonth(11, this.year, appointments, this.academic);
    this.januaryPending = await this.db.fetchAppointmentAcceptOfMonth(0, this.year+1, appointments, this.academic);
    this.februaryPending = await this.db.fetchAppointmentAcceptOfMonth(1, this.year+1, appointments, this.academic);
    this.marchPending = await this.db.fetchAppointmentAcceptOfMonth(2, this.year+1, appointments, this.academic);
    this.aprilPending = await this.db.fetchAppointmentAcceptOfMonth(3, this.year+1, appointments, this.academic);
    this.mayPending = await this.db.fetchAppointmentAcceptOfMonth(4, this.year+1, appointments, this.academic);
  }

  loadBarAppointmentsFirstSemester() {
    console.log("Loading Bar Graph");
    let ctx = document.getElementById("firstSemChartModal");
    
    this.barChartFirst = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Jun", "Jul", "Aug", "Sep", "Oct"],
            datasets: [{
                      label: "Finished",
                      data: [this.juneFinish, this.julyFinish, this.augustFinish, 
                        this.septemberFinish, this.octoberFinish],
                      backgroundColor: [
                          'rgba(105,97,255, 0.2)',
                          'rgba(93,230,120, 0.2)',
                          'rgba(255,105,97, 0.2)',
                          'rgba(97,168,255, 0.2)',
                          'rgba(255,184,97, 0.2)'
                      ],
                      borderColor: [
                          'rgba(105,97,255, 1)',
                          'rgba(93,230,120, 1)',
                          'rgba(255,105,97, 1)',
                          'rgba(97,168,255, 1)',
                          'rgba(255,184,97, 1)'
                      ],
                      borderWidth: 1
                  },
                  {
                    label: "Not Finished",
                    data: [this.junePending, this.julyPending, this.augustPending, 
                      this.septemberPending, this.octoberPending,],
                    backgroundColor: [
                          'rgba(105,97,255, 1)',
                          'rgba(93,230,120, 1)',
                          'rgba(255,105,97, 1)',
                          'rgba(97,168,255, 1)',
                          'rgba(255,184,97, 1)'
                    ],
                    borderColor: [
                          'rgba(105,97,255, 1)',
                          'rgba(93,230,120, 1)',
                          'rgba(255,105,97, 1)',
                          'rgba(97,168,255, 1)',
                          'rgba(255,184,97, 1)'
                    ],
                    borderWidth: 1
                }]
              },
              options: { 
                  legend: { display: false },
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero:true
                          }
                      }]
                  }
              }
    });
  }

  loadBarAppointmentsSecondSemester() {
    console.log("Loading Bar Graph");
    let ctx = document.getElementById("secondSemChartModal");

    this.barChartSecond = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Nov", "Dec", "Jan", "Feb", "March"],
            datasets: [{
                      label: "Finished",
                      data: [this.novemberFinish,
                        this.decemberFinish, this.januaryFinish, this.februaryFinish,
                        this.marchFinish],
                      backgroundColor: [
                          'rgba(105,97,255, 0.2)',
                          'rgba(93,230,120, 0.2)',
                          'rgba(255,105,97, 0.2)',
                          'rgba(97,168,255, 0.2)',
                          'rgba(255,184,97, 0.2)'
                      ],
                      borderColor: [
                          'rgba(105,97,255, 1)',
                          'rgba(93,230,120, 1)',
                          'rgba(255,105,97, 1)',
                          'rgba(97,168,255, 1)',
                          'rgba(255,184,97, 1)'
                      ],
                      borderWidth: 1
                  },
                  {
                    label: "Not Finished",
                    data: [this.novemberPending,
                      this.decemberPending, this.januaryPending, this.februaryPending,
                      this.marchPending],
                    backgroundColor: [
                          'rgba(105,97,255, 1)',
                          'rgba(93,230,120, 1)',
                          'rgba(255,105,97, 1)',
                          'rgba(97,168,255, 1)',
                          'rgba(255,184,97, 1)'
                    ],
                    borderColor: [
                          'rgba(105,97,255, 1)',
                          'rgba(93,230,120, 1)',
                          'rgba(255,105,97, 1)',
                          'rgba(97,168,255, 1)',
                          'rgba(255,184,97, 1)'
                    ],
                    borderWidth: 1
                }]
              },
              options: { 
                  legend: { display: false },
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero:true
                          }
                      }]
                  }
              }
  
    });
  }

  loadBarAppointmentsSummer() {
    console.log("Loading Bar Graph");
    let ctx = document.getElementById("summerChartModal");
    
    this.barChartSummer = new Chart(ctx, {
       type: 'bar',
      data: {
          labels: ["April","May"],
          datasets: [{
                    label: "Finished",
                    data: [this.aprilFinish, this.mayFinish],
                    backgroundColor: [
                        'rgba(105,97,255, 0.2)',
                        'rgba(93,230,120, 0.2)'
                    ],
                    borderColor: [
                        'rgba(105,97,255, 1)',
                        'rgba(93,230,120, 1)'
                    ],
                    borderWidth: 1
                },
                {
                  label: "Not Finished",
                  data: [this.aprilPending, this.mayPending],
                  backgroundColor: [
                    'rgba(105,97,255, 1)',
                    'rgba(93,230,120, 1)'
                  ],
                  borderColor: [
                    'rgba(105,97,255, 1)',
                    'rgba(93,230,120, 1)'
                  ],
                  borderWidth: 1
              }]
            },
            options: { 
                legend: { display: false },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }

    
    });
  }

  loadNoStudent(){
    console.log("Loading Bar Graph");
    let ctx = document.getElementById("studentChartModal");

    this.pieChart = new Chart(ctx, {

            type: 'doughnut',
            data: {
                labels: ["No Students Found"],
                datasets: [{
                    data: [100],
                    backgroundColor: [
                        'rgba(128,128,128, 0.2)'
                    ],
                    borderColor: [
                        'rgba(128,128,128, 1)'
                    ],
                }]
            },
            options: {
                legend: {
                    onClick: null
                },
                tooltips: {
                     enabled: false
                }
            }

        },
    );

  }

  loadPieStudents(){
    console.log("Loading Bar Graph");
    let ctx = document.getElementById("studentChartModal");

    this.pieChart = new Chart(ctx, {

        type: 'doughnut',
        data: {
            labels: ["Not Enrolled", "Enrolled"],
            datasets: [{
                data: [this.studentNotEnrolled, this.studentsEnrolled],
                backgroundColor: [
                    'rgba(255,105,97, 0.2)',
                    'rgba(97,168,255, 0.2)'
                ],
                borderColor: [
                    'rgba(255,105,97, 1)',
                    'rgba(97,168,255, 1)'
                ],
            }]
        },
        hoverBackgroundColor: [
            "#ff6961",
            "#61a8ff"
        ],
        options: {
            legend: {
                reverse:true,
                onClick: null
            }
        }

    });

  }

  close() {
      this.appointment.unsubscribe();
      this.student.unsubscribe();
      
      this.viewCtrl.dismiss();
  }
}
