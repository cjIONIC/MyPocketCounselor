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

  //Months
  June: any;
  July: any;
  August: any;
  September: any;
  October: any;
  November: any;
  December: any;
  January: any;
  February: any;
  March: any;
  April: any;
  May: any;

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
      this.fetchAllAppointments();
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

  /*
  async fetchAllAcademicUnits() {
    let academics = await this.db.fetchAllNodesByTableInDatabase("academic");

    this.academicList.push({
      acID: 99,
      acCode: "All",
      acName: "All"
    })

    academics.forEach(academic => {
      this.academicList.push(academic);
    })

    console.log("Academic List: ", this.academicList);
  }
  */

  changeDate(ev: any) {
    console.log("Date: ", ev);
    this.yearPlus = ev["year"] + 1;
  }

  search() {

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

  /*
  fetchAppointments() {
    console.log("Semester: ", this.semester);
    let list = this.fireDatabase.list<Item>("appointment");
    let item = list.valueChanges();

    item.subscribe(async appointments => {
      if(this.semester === "First") {
        await this.fetchFirstSemester(appointments);
        //await this.loadPieAppointments(semester)
      } else if (this.semester === "Second") {
        await this.fetchSecondSemester(appointments);
      } else {
  
      }
    })

  }
  */

  fetchAllAppointments() {
    let list = this.fireDatabase.list<Item>("appointment");
    let item = list.valueChanges();

    item.subscribe(async appointments => {
      await this.fetchFinishYear(appointments);
      await this.fetchAcceptYear(appointments);
      await this.loadLineAppointmentsYear();

      this.loadBarAppointmentsFirstSemester();
      this.loadBarAppointmentsSecondSemester();
      this.loadBarAppointmentsSummer();
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
        console.log("Academic: ", this.academicList);
      })

    })
  }

  async fetchFirstSemester(appointments) {
    this.June = await this.db.fetchAppointmentOfMonth(5, this.year, appointments, this.academic);
    this.July = await this.db.fetchAppointmentOfMonth(6, this.year, appointments, this.academic);
    this.August = await this.db.fetchAppointmentOfMonth(7, this.year, appointments, this.academic);
    this.September = await this.db.fetchAppointmentOfMonth(8, this.year, appointments, this.academic);
    this.October = await this.db.fetchAppointmentOfMonth(9, this.year, appointments, this.academic);
  }

  async fetchSecondSemester(appointments) {
    this.November = await this.db.fetchAppointmentOfMonth(10, this.year, appointments, this.academic);
    this.December = await this.db.fetchAppointmentOfMonth(11, this.year, appointments, this.academic);
    this.January = await this.db.fetchAppointmentOfMonth(0, this.year+1, appointments, this.academic);
    this.February = await this.db.fetchAppointmentOfMonth(1, this.year+1, appointments, this.academic);
    this.March = await this.db.fetchAppointmentOfMonth(3, this.year+1, appointments, this.academic);
  }

  fetchSummer() {
  }

  loadBarAppointments() {
    let ctx = document.getElementById("myChart");
    
    let label1, label2, label3, label4, label5;
    let data1, data2, data3, data4, data5;

    if(this.semester === "First") {
      label1 = "June";
      label2 = "July";
      label3 = "August";
      label4 = "September";
      label5 = "October";

      data1 = this.June;
      data2 = this.July;
      data3 = this.August;
      data4 = this.September;
      data5 = this.October;
    } else if(this.semester === "Second") {
      label1 = "November";
      label2 = "December";
      label3 = "January";
      label4 = "February";
      label5 = "March";

      data1 = this.November;
      data2 = this.December;
      data3 = this.January;
      data4 = this.February;
      data5 = this.March;
    }

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: [label1, label2, label3, label4, label5],
          datasets: [{
                    data: [data1, data2, data3, data4, data5],
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

  loadBarAppointmentsFirstSemester() {
    let ctx = document.getElementById("firstSemChart");
    
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
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)'
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

  loadLineAppointmentsYear() {
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
                label: "Finished",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(105,97,255,0.4)",
                borderColor: "rgba(105,97,255,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(105,97,255,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [this.juneFinish, this.julyFinish, this.augustFinish, 
                      this.septemberFinish, this.octoberFinish, this.novemberFinish,
                      this.decemberFinish, this.januaryFinish, this.februaryFinish,
                      this.marchFinish,this.aprilFinish, this.mayFinish],
              },
              //Unfinished
              {
                label: "Total",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(97,255,105,0.4)",
                borderColor: "rgba(97,255,105,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0, 
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(97,255,105,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointRadius: 1,
                pointHitRadius: 10,
                data: [this.junePending, this.julyPending, this.augustPending, 
                      this.septemberPending, this.octoberPending, this.novemberPending,
                      this.decemberPending, this.januaryPending, this.februaryPending,
                      this.marchFinish,this.aprilPending, this.mayPending],
              }
          ]
      },
      options: { 
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {enabled: false},
        hover: {mode: null},
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
