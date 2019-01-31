import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Item } from 'ionic-angular';
import { Chart } from 'chart.js';
import { AngularFireDatabase } from 'angularfire2/database';
import { DatabaseProvider } from '../../providers/database/database';
import moment from 'moment';


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

  @ViewChild('doughnutCanvas') doughnutCanvas;
  
  barChart: any;

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

  year: any;
  yearPlus: any;
  dateDefault: any;

  academic: any;
  semester: any;

  academicList = [];

  constructor(public navCtrl: NavController, 
      public navParams: NavParams,
      public fireDatabase: AngularFireDatabase,
      public db: DatabaseProvider) {


        this.initialize();
  }

  initialize() {
    try {
      let date = new Date(moment().format());
      date.setFullYear(date.getFullYear()-1)
      this.dateDefault = moment(date).format();
      this.yearPlus = date.getFullYear()+1;
      this.year = date.getFullYear();

      this.academic = 99;

      this.fetchAllAcademicUnits();
      this.verifyDate(date);
    } catch {

    }

  }

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

    this.fetchAppointments();


  }

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

  fetchConcerns() {
    
  }

  async fetchFirstSemester(appointments) {
    this.June = await this.db.fetchAppointmentOfMonth(6, this.year, appointments, this.academic);
    this.July = await this.db.fetchAppointmentOfMonth(7, this.year, appointments, this.academic);
    this.August = await this.db.fetchAppointmentOfMonth(8, this.year, appointments, this.academic);
    this.September = await this.db.fetchAppointmentOfMonth(9, this.year, appointments, this.academic);
    this.October = await this.db.fetchAppointmentOfMonth(10, this.year, appointments, this.academic);
    this.loadBarAppointments();
  }

  async fetchSecondSemester(appointments) {
    this.November = await this.db.fetchAppointmentOfMonth(10, this.year, appointments, this.academic);
    this.December = await this.db.fetchAppointmentOfMonth(11, this.year, appointments, this.academic);
    this.January = await this.db.fetchAppointmentOfMonth(0, this.year+1, appointments, this.academic);
    this.February = await this.db.fetchAppointmentOfMonth(1, this.year+1, appointments, this.academic);
    this.March = await this.db.fetchAppointmentOfMonth(3, this.year+1, appointments, this.academic);
    this.loadBarAppointments();
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
  

  
  ionViewDidLoad() {
    console.log('ionViewDidLoad HeadControlsStatisticsPage');
  }

}
