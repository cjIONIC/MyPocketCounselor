import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Item, Slides, ModalController, App } from 'ionic-angular';
import { Chart } from 'chart.js';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import moment from 'moment';
import { ModalStatisticsComponent } from '../../components/modal-statistics/modal-statistics';

/**
 * Generated class for the HeadControlsStatisticsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-head-controls-statistics',
  templateUrl: 'head-controls-statistics.html',
})
export class HeadControlsStatisticsPage {
  
  @ViewChild(Slides) slides: Slides;

  @ViewChild('doughnutCanvas') doughnutCanvas;
  
  barChart: any;
  date: any;

  allStudents: any;

  //Months
  juneEnrolled: any;
  julyEnrolled: any;
  augustEnrolled: any;
  septemberEnrolled: any;
  octoberEnrolled: any;
  novemberEnrolled: any;
  decemberEnrolled: any;
  januaryEnrolled: any;
  februaryEnrolled: any;
  marchEnrolled: any;
  aprilEnrolled: any;
  mayEnrolled: any;
  
  //Months
  juneNotEnrolled: any;
  julyNotEnrolled: any;
  augustNotEnrolled: any;
  septemberNotEnrolled: any;
  octoberNotEnrolled: any;
  novemberNotEnrolled: any;
  decemberNotEnrolled: any;
  januaryNotEnrolled: any;
  februaryNotEnrolled: any;
  marchNotEnrolled: any;
  aprilNotEnrolled: any;
  mayNotEnrolled: any;

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

  year: any;
  yearPlus: any;
  dateDefault: any;

  academic: any;
  semester: any;

  schoolYear: any;

  academicList = [];

  constructor(public navCtrl: NavController, 
      public navParams: NavParams,
      public fireDatabase: AngularFireDatabase,
      public app: App,
      public modalCtrl: ModalController,
      public db: DatabaseProvider) {


        this.initialize();
  }

  async initialize() {
    try {
      this.date = new Date(moment().format());
      let month = this.date.getMonth();


       //Verify's the year
       if(month.toString().match(/^(5|6|7|8|9|10|11)$/)) {
        this.year = this.date.getFullYear();
        this.schoolYear = this.year + " - " + (this.year+1);
      }
      else if (month.toString().match(/^(0|1|2|3|4)$/)) {
        this.date.setFullYear(this.date.getFullYear()-1);
        this.year = this.date.getFullYear();
        this.schoolYear = this.year + " - " + (this.year+1);
      }

      console.log("School Year: ", this.schoolYear);

      this.academic = 99;

     // this.verifyDate(date);
      this.fetchAllStudents();
      await this.fetchAllAppointments();
      await this.fetchAcademicUnitStatistics();
      
      //Identifies semestral period
      if(month.toString().match(/^(5|6|7|8|9)$/)) {
        console.log("First Semester");
        this.slides.slideTo(0, 500);
      }else if (month.toString().match(/^(0|1|2|10|11)$/)) {
        console.log("Second Semester");
        this.slides.slideTo(1, 500);
      }else {
        console.log("Summer");
        this.slides.slideTo(2, 500);
      }


    } catch {

    }

  }

  changeDate(ev: any) {
    console.log("Date: ", ev);
    this.yearPlus = ev["year"] + 1;
  }

   verifyDate(date) {
    console.log("Fetching Date: ", date.toDateString());
    let month = date.getMonth();
    console.log("Month: ", month);
    let semester;

    //Identifies which semestral period the appointment is set
    if(month.toString().match(/^(5|6|7|8|9)$/)) this.semester = "First";
    else if (month.toString().match(/^(0|1|2|10|11)$/)) this.semester = "Second";
    else this.semester = "Summer";

    //this.fetchAppointments();


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
      this.allStudents = await this.db.fetchAllStudents(this.year, students);
      /*
      await this.fetchEnrolledStudents(students);
      await this.fetchNotEnrolledStudents(students);

      
      await this.loadLineStudentsYear();
      */
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

  fetchAcademicUnitStatistics() {
    let list = this.fireDatabase.list<Item>("academic");
    let item = list.valueChanges();

    this.fireDatabase.list<Item>("counselor")
    .valueChanges().subscribe(counselors => {

      item.subscribe(async academics => {
        this.academicList = await this.db.fetchAcademicUnitStatistics(academics, counselors, this.date);
        console.log("Academic: ", await this.academicList);

      })

    })
  }

  loadBarAppointmentsFirstSemester() {
    let ctx = document.getElementById("firstSemChart");
    
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["Jun", "Jul", "Aug", "Sep", "Oct"],
          datasets: [{
                    label: "Finished",
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
                  label: "Not Finished",
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
    let ctx = document.getElementById("secondSemChart");

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["Nov", "Dec", "Jan", "Feb", "March"],
          datasets: [{
                    label: "Finished",
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
                  label: "Not Finished",
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
    let ctx = document.getElementById("summerChart");
    
    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ["April","May"],
          datasets: [{
                    label: "Finished",
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
                  label: "Not Finished",
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

  loadLineStudentsYear() {
    let ctx = document.getElementById("yearlyChart");
    

     this.barChart = new Chart(ctx, {

      type: 'line',
      data: {
          labels: ["Jun", "Jul", "Aug", "Sep", "Oct", 
                    "Nov", "Dec", "Jan", "Feb", "Mar", 
                    "Apr", "May", ],
          datasets: [
              //Finished
              {
                label: "Enrolled",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(97,168,255,0.4)",
                borderColor: "rgba(97,168,255,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(105,97,255,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(97,168,255,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [this.juneEnrolled, this.julyEnrolled, this.augustEnrolled, 
                      this.septemberEnrolled, this.octoberEnrolled, this.novemberEnrolled,
                      this.decemberEnrolled, this.januaryEnrolled, this.februaryEnrolled,
                      this.marchEnrolled,this.aprilEnrolled, this.mayEnrolled],
              },
              //Unfinished
              {
                label: "Not Enrolled",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(255,184,97,0.4)",
                borderColor: "rgba(255,184,97,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0, 
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(255,184,97,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(255,184,97,1)",
                pointHoverBorderColor: "rgba(255,184,97,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [this.juneNotEnrolled, this.julyNotEnrolled, this.augustNotEnrolled, 
                      this.septemberNotEnrolled, this.octoberNotEnrolled, this.novemberNotEnrolled,
                      this.decemberNotEnrolled, this.januaryNotEnrolled, this.februaryNotEnrolled,
                      this.marchNotEnrolled,this.aprilNotEnrolled, this.mayNotEnrolled],
              }
          ]
      },
      options: { 
        responsive: true,
        maintainAspectRatio: false,
      }

  });

  }

  async loadPrevious() {
    console.log("Previous school year");

    this.date.setFullYear(this.date.getFullYear()-1);
    this.year = this.date.getFullYear();
    this.schoolYear = this.year + " - " + (this.year+1);

    console.log("School Year: ", this.schoolYear);

    this.academic = 99;

   // this.verifyDate(date);
    this.fetchAllAppointments();
    await this.fetchAcademicUnitStatistics();
  }

  async loadNext() {
    console.log("Next school year");

    this.date.setFullYear(this.date.getFullYear()+1);
    this.year = this.date.getFullYear();
    this.schoolYear = this.year + " - " + (this.year+1);

    console.log("School Year: ", this.schoolYear);

    this.academic = 99;

   // this.verifyDate(date);
    this.fetchAllAppointments();
    await this.fetchAcademicUnitStatistics();
  }
  
  viewStatistics(id) {
    console.log("ID: ", id);

    //this.app.getRootNav().push(HeadControlsStatisticsAcademicPage, {id: id, date: this.date});

    const modal = this.modalCtrl.create(ModalStatisticsComponent,  { id: id, date: this.date},{ cssClass: 'custom-modal-statistics' });
    modal.present();
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad HeadControlsStatisticsPage');
  }

}
