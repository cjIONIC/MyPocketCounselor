import { Component } from '@angular/core';
import { NavParams, Item, ViewController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import { Chart } from 'chart.js';

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

  barChart: any;

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

    item.subscribe(async appointments => {
      await this.fetchFinishYear(appointments);
      await this.fetchAcceptYear(appointments);

      this.loadBarAppointmentsFirstSemester();
      this.loadBarAppointmentsSecondSemester();
      this.loadBarAppointmentsSummer();
    })
  }

  fetchAllStudents(){
      let list = this.fireDatabase.list<Item>("student");
      let item = list.valueChanges();

      item.subscribe(async students => {
        this.studentsEnrolled = await this.db.fetchAllStudentsOfUnit(students, this.academic, "Enrolled");
        this.studentNotEnrolled = await this.db.fetchAllStudentsOfUnit(students, this.academic, "Not Enrolled");

        this.loadPieStudents();
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
    
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["Jun", "Jul", "Aug", "Sep", "Oct"],
          datasets: [{
                    data: [this.juneFinish, this.julyFinish, this.augustFinish, 
                      this.septemberFinish, this.octoberFinish],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                },
                {
                  data: [this.junePending, this.julyPending, this.augustPending, 
                    this.septemberPending, this.octoberPending,],
                  backgroundColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)'
                  ],
                  borderColor: [
                      'rgba(255,99,132,1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)'
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

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["Nov", "Dec", "Jan", "Feb", "March"],
          datasets: [{
                    data: [this.novemberFinish,
                      this.decemberFinish, this.januaryFinish, this.februaryFinish,
                      this.marchFinish],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                },
                {
                  data: [this.novemberPending,
                    this.decemberPending, this.januaryPending, this.februaryPending,
                    this.marchFinish],
                  backgroundColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)'
                  ],
                  borderColor: [
                      'rgba(255,99,132,1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)'
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
    
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["April","May"],
          datasets: [{
                    data: [this.aprilFinish, this.mayFinish],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                },
                {
                  data: [this.aprilPending, this.mayPending],
                  backgroundColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                  ],
                  borderColor: [
                      'rgba(255,99,132,1)',
                      'rgba(54, 162, 235, 1)'
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

  loadPieStudents(){
    console.log("Loading Bar Graph");
    let ctx = document.getElementById("studentChartModal");
    
    this.barChart = new Chart(ctx, {

        type: 'doughnut',
        data: {
            labels: ["Enrolled", "Not Enrolled"],
            datasets: [{
                data: [this.studentsEnrolled, this.studentNotEnrolled],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)'
                ],
            }]
        },
        hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
        ],
        options: {
            legend: {
                onClick: null
            }
          }

    },
);

  }

  close() {
    this.viewCtrl.dismiss();
  }
}
