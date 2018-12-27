import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from 'ionic-angular';
//Firebase
import firebase, { app } from 'firebase';
import { AngularFireAuth} from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireStorage } from 'angularfire2/storage';

//Ionic Storage
import { Storage } from '@ionic/storage';

import moment from 'moment';
import { not } from '@angular/compiler/src/output/output_ast';

/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DatabaseProvider {

  //Variables
  userInfo = [];
  googleFound = false;
  counselorAcad = [];
  currentDateMDYhmA; //Month Day Year Hour Minute Meridian
  currentDateMDY; //Month Day Year
  

  constructor(public http: HttpClient,
    private fire: AngularFireAuth,
    private fireStorage: AngularFireStorage,
    private ionicStorage: Storage,
    public fireDatabase: AngularFireDatabase) {
    console.log('initialized Database Provider');

  }

  /*********************/
  /*** P R O F I L E ***/
  /*********************/

  getUserInfo() {
    return Promise.resolve(this.userInfo);
  }

  async refreshUserInfo(accounts, userInfo) {
    let user = [];

    accounts.forEach(account => {
      if(userInfo["type"] === "Student") {
        if(userInfo["id"] === account["sID"]) {
          user.push({
            "id": account["sID"],
            "firstname": account["sFirstName"],
            "lastname": account["sLastName"],
            "username": account["sUsername"],
            "password":account["sPassword"],
            "academic": account["acID"],
            "picture": account["sPicture"],
            "type": "Student"
          });
        }
      } else {
        if(userInfo["id"] === account["cID"]) {
          user.push({
            "email": account["cEmail"],
            "id": account["cID"],
            "firstname": account["cFirstName"],
            "lastname": account["cLastName"],
            "picture": account["cPicture"],
            "username": account["cUsername"],
            "password":account["cPassword"],
            "type": account["cType"]
          });
        }
      }
    })

    this.userInfo = user[0];
    this.setProfileInStorage();
  }
  
  //Setting user profile from the ionic sqlite database
  setProfileInStorage() {
    //let user = [];
    console.log("Seting User Profile");
    this.ionicStorage.set('profile', this.userInfo);
  }
  
  //Getting user profile from the ionic sqlite database
  async getProfileInStorage() {
    console.log("Seting User Profile");
    let profile = [];
    profile = await this.ionicStorage.get('profile');

    return Promise.resolve(profile);
  }

  /*********************/
  /** A C C O U N T S **/
  /*********************/
  //Returns an array with only values of the table
  fetchAllNodesByTableInDatabase(table) {
    let list = this.fireDatabase.list<Item>(table);
    let item = list.valueChanges();
    const accountsArray = new Promise<any[]>((resolve) => {
      item.subscribe( async accounts => resolve(await accounts));
    });

    return accountsArray;
  }

  //Returns an object with all details of the table
  fetchAllNodesBySnapshot(table) {
    let ref =this.fireDatabase.list(table);
    const accountsObject = new Promise((resolve) => {
      ref.snapshotChanges()
      .subscribe( async accounts => resolve(await accounts));
    });

    return accountsObject;
  }

  /*********************/
  /****** L O G S ******/
  /*********************/
  loginSearchStudent(googleUser, username, password, type) {
    console.log("Searching student...");

    var list = this.fireDatabase.list<Item>('student');
    var item = list.valueChanges();

    return new Promise((resolve) => {
      item.subscribe( async array => {
        var foundAccount = false;
        var keys = Object.keys(array);
        var user = []; //Temporary array for user info storage
        
        if(type == "googleSignIn") { //For Google Plus login
          var email = googleUser["email"];

          for ( var i = 0; i<keys.length; i++) {
            var count  = keys[i];
            var sEmail = array[count].sEmail;
      
            if (email == sEmail) {
               user.push({
                "id": array[count].sID,
                "firstname": array[count].sFirstName,
                "lastname": array[count].sLastName,
                "picture": array[count].sPicture,
                "username": array[count].sUsername,
                "password":array[count].sPassword,
                "academic": array[count].acID,
                "email":array[count].sEmail,
                "type": "Student"
               });
      
              foundAccount = true;
            }
          }          
        } else { //For Username and Password login
          for ( var y = 0; y<keys.length; y++) {
            var count  = keys[y];
            var sUsername = array[count].sUsername;
            var sPassword = array[count].sPassword;
      
            if (username == sUsername && password == sPassword) {
      
              user.push({
                "id": array[count].sID,
                "firstname": array[count].sFirstName,
                "lastname": array[count].sLastName,
                "username": array[count].sUsername,
                "password":array[count].sPassword,
                "academic": array[count].acID,
                "picture": array[count].sPicture,
                "type": "Student"
              });

              foundAccount = true;
            }
          }
        }

        if(foundAccount) {
          this.userInfo = await  user[0];
          await this.setProfileInStorage();
          console.log("User info: ", this.userInfo)
        }

        resolve(foundAccount);
      });
    });
  }

  loginSearchCounselor(googleUser, username, password, type) {
    console.log("Searching counselor...");

    var list = this.fireDatabase.list<Item>('counselor');
    var item = list.valueChanges();

    return new Promise((resolve) => {
      item.subscribe( async array => {
        var foundAccount = false;
        var keys = Object.keys(array);
        var user = []; //Temporary array for user info storage
  
        if(type == "googleSignIn") {
          var email = googleUser["email"];

          for ( var i = 0; i<keys.length; i++) { //For Google Plus login
            var count  = keys[i];
            var cEmail = array[count].cEmail;
    
            if (email == cEmail) {
              user.push({
                "id": array[count].cID,
                "firstname": array[count].cFirstName,
                "lastname": array[count].cLastName,
                "picture": array[count].cPicture,
                "username": array[count].cUsername,
                "password":array[count].cPassword,
                "email":array[count].cEmail,
                "number":array[count].cNumber,
                "type": array[count].cType
              });
      
              foundAccount = true;
            }
          }          
        } else { //For Username and Password login
          for ( var i = 0; i<keys.length; i++) {
            var count  = keys[i];
            var cUsername = array[count].cUsername;
            var cPassword = array[count].cPassword;
      
            if (username == cUsername && password == cPassword) {
      
              user.push({
                "id": array[count].cID,
                "firstname": array[count].cFirstName,
                "lastname": array[count].cLastName,
                "picture": array[count].cPicture,
                "username": array[count].cUsername,
                "password":array[count].cPassword,
                "email":array[count].cEmail,
                "number":array[count].cNumber,
                "type": array[count].cType
              });

              foundAccount = true;
            }
          }
        }

        if(foundAccount == true) { 
          this.userInfo = await  user[0];
          await this.setProfileInStorage();
          console.log("User info: ", this.userInfo)
        }
        resolve(foundAccount);
      });
    });
  }

  async logoutUser() {
    this.userInfo = [];
    this.ionicStorage.set('profile', this.userInfo);

    return;
  }

  /*********************/
  /** R E G I S T E R **/
  /*********************/
  //Checks duplicates of username
  registerCheckUsernameDuplicates(accounts, username, type) {
    console.log('%c Checking Username Duplicates','color: white; background: violet; font-size: 16px');
    if(type === "Counselor") {
      accounts.forEach(account => {
        if(account["cUsername"] === username)
          return true;
      });
    } else if(type === "Student") {
      accounts.forEach(account => {
        if(account["sUsername"] === username)
          return true;
      });
    } else {
      accounts.forEach(account => {
        if(account["rUsername"] === username)
          return true;
      });
    }
    return false;
  }

  //Registers student to the database
  async registerStudent(fname, lname, email, username,
    password, academic, status, image) {
    let acID = parseInt(academic);
    let imageURL;

    let today = moment().format();
    let date = new Date(today);
    console.log("Date: ", date);

    let numeric = Math.random().toString().replace('0.', '').substring(0,2);
    let timestamp = new Date().getTime().toString().substring(5, 13);
    let id = numeric+timestamp;
    
    if(image) {
      let filePath = await this.uploadImage("registration", image);
      imageURL = await this.downloadImage(filePath);
    } else imageURL = "No image";
    

    this.fireDatabase.list('/registration').push({
      rID: parseInt(id),
      rFirstName: fname,
      rLastName: lname,
      rEmail: email,
      rPicture: imageURL,
      rUsername: username,
      rPassword: password,
      rStatus: status,
      rDatetime: date.toString(),
      acID: acID
    });

   return true;
  }

  registerCheckAccounts(student) {
    var foundAccount = false;
    var list = this.fireDatabase.list<Item>('registration');
    var item = list.valueChanges();
    console.log("Student: ", student);

    return new Promise((resolve) => {
      item.subscribe( array => {
        var keys = Object.keys(array);
  
        for(var i = 0; i<keys.length; i++) {
          var count = keys[i];
          var email = array[count].rEmail;
          
          if(student["email"] === email) {
            console.log("Found!");
            foundAccount = true;
          }
        }

        resolve(foundAccount);
      });
    })
  }

  async fetchRegistrations(academics, requests) {
    let requestList = [];

    requests.forEach(request => {

      academics.forEach(academic => {
        if(request["acID"] === academic["acID"] || this.userInfo['type'] === "GTD Head") {
          let name = request["rLastName"] +", "+ request["rFirstName"];

          requestList.push({
            id: request["rID"],
            name: name,
            picture: request["rPicture"],
            academic: academic["acCode"],
            datetime: request["rDatetime"]
          });
        }
      })
    })

    requestList.sort(function(a,b) {
      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;
    });

    await requestList.reverse();
    return await requestList;
  }

  async fetchRequestProfile(id, accounts) {
    let profile = [];
    let academics = await this.fetchAllNodesByTableInDatabase("academic");

    accounts.forEach(account => {
      if(account["rID"] === id) { //Account Found
        let academicUnit = [];
        let name = account["rFirstName"] + " " + account["rLastName"];
        academics.forEach(async academic => {
          if(academic["acID"] === account["acID"]) {
            academicUnit.push({
              id: academic["acID"],
              name: academic["acName"]
            });
          }
        })

        profile.push({
          id: account["rID"],
          name: name,
          picture: account["rPicture"],
          email: account["rEmail"],
          status: account["rStatus"],
          academic: academicUnit
        });
      }
    })

    console.log("Profile: ", profile);

    return profile;
  }

  async acceptStudentRequest(profile, id) {
    console.log("Profile: ", profile);

    this.fireDatabase.list('/student').push(profile)
      .then(() => {
        let ref=this.fireDatabase.list('registration');

        ref.snapshotChanges(['child_added'])
        .subscribe(actions => {
          var key = Object.keys(actions);
          var reqTable = actions;
          for(var y = 0; y < key.length; y++) {
            var count = key[y];
            var reqKey = reqTable[count].key;
            var req = reqTable[count].payload.val();
            var id = req.rID;

            if(id ===  id) {
              ref.remove(reqKey);
              console.log("%cSuccessfully deleted request!", "color: white; background: violet; font-size: 10px");
            }
          }
        });
      });
   
    return;
  }

  async rejectStudentRequest(profile) {
    let ref=this.fireDatabase.list('registration');

    ref.snapshotChanges(['child_added'])
    .subscribe(registration => {
      let key = Object.keys(registration);
      for(let y = 0; y < key.length; y++) {
        let count = key[y];
        let regKey = registration[count].key;
        let reg = registration[count].payload.val();
        let regID = reg.rID;

        if(regID === profile["id"]) {
          ref.remove(regKey);
          console.log("%cSuccessfully rejected account!", "color: white; background: violet; font-size: 10px");
        }
      }
    });
  }

  /*********************/
  /** A C A D E M I C **/
  /*********************/
  async fetchMatchAcademicUnit() {
    let academicList = [];
    let academics = await this.fetchAllNodesByTableInDatabase("academic");

    academics.forEach(academic => {
      if(academic["cID"] === this.userInfo["id"] && this.userInfo["type"] !== "GTD Head")
        academicList.push(academic)
      if(this.userInfo["type"] == "GTD Head")
        academicList.push(academic)
    })

    await academicList.sort(function(a,b) {
      if(a.acName < b.acName) { return -1; }
      if(a.acName > b.acName) { return 1; }
      return 0;
    });

    return await academicList;
  }

  /*********************/
  /****** F E E D ******/
  /*********************/
  async filterFeedForStudent(posts, likes, academics, counselors) {
    let studentFeed = [];

    posts.forEach(async post => {
      if(post["acID"] === this.userInfo["academic"] || post["acID"] === 1) {

        let liked = false, postAcademic, counselorAvatar, counselorName;

        likes.forEach(like => {
          if(like["pID"] === post["pID"]) liked = true;
        })

        academics.forEach(academic => {
          if(academic["acID"] === post["acID"]) postAcademic = academic["acCode"];
        })

        counselors.forEach(counselor => {
          if(counselor["cID"] === post["cID"]) {
            counselorAvatar = counselor["cPicture"];
            counselorName = counselor["cFirstName"] + " " + counselor["cLastName"];
          }
        })

        let pushEndDate, pushEndTime;

        let endDate = new Date(post["pEnd"]);
        if(endDate.getFullYear() < 2000) pushEndDate = false;
        else pushEndDate = true;

        let endTime = (new Date(post["pEnd"])).getHours() + (new Date(post["pEnd"])).getMinutes();
        if(endTime === 0) pushEndTime = false;
        else pushEndTime = true;

        studentFeed.push({
          id : post["pID"],
          title : post["pTitle"],
          counselor : counselorName,
          avatar : counselorAvatar,
          location : post["pLocation"],
          startDate : post["pStart"],
          endDate : post["pEnd"],
          pushEndDate: pushEndDate,
          pushEndTime: pushEndTime,
          description : post["pDescription"],
          picture : post["pPicture"],
          like : post["pLike"],
          icon : liked,
          datetime :post["pDatetime"],
          academic : postAcademic,
          type: post["pType"]
        });
      }
    });

    await studentFeed.reverse();
    return await studentFeed;
  }

  async filterFeedForCounselor(posts, academics, allAcademics, counselors) {
    let counselorFeed = [];

    posts.forEach(async post => {
      let pushPost = false;
      let postAcademic, counselorAvatar, counselorName;

      if(this.userInfo["type"] === "GTD Head" || post["acID"] === 1) {
        pushPost = true;

        allAcademics.forEach( academic => {
          if(academic["acID"] === post["acID"]) postAcademic = academic["acCode"];
        })

      } else {
        academics.forEach(assign => {
          if(assign["acID"] === post["acID"]) {
            postAcademic = assign["acCode"]
            pushPost = true
          }
        })
      }

      if(await pushPost) {

        counselors.forEach(counselor => {
          if(counselor["cID"] === post["cID"]) {
            counselorAvatar = counselor["cPicture"];
            counselorName = counselor["cFirstName"] + " " + counselor["cLastName"];
          }
        })

        let pushEndDate, pushEndTime;

        let endDate = new Date(post["pEnd"]);
        if(endDate.getFullYear() < 2000) pushEndDate = false;
        else pushEndDate = true;

        let endTime = (new Date(post["pEnd"])).getHours() + (new Date(post["pEnd"])).getMinutes();
        if(endTime === 0) pushEndTime = false;
        else pushEndTime = true;

        counselorFeed.push({
          id : post["pID"],
          title : post["pTitle"],
          counselor : counselorName,
          avatar : counselorAvatar,
          location : post["pLocation"],
          startDate : post["pStart"],
          endDate : post["pEnd"],
          pushEndDate: pushEndDate,
          pushEndTime: pushEndTime,
          description : post["pDescription"],
          picture : post["pPicture"],
          like : post["pLike"],
          datetime :post["pDatetime"],
          academic : postAcademic,
          type: post["pType"]
        });
      }
    });

    await counselorFeed.reverse();
    return await counselorFeed;
  }

  //Adds Event and Quotes Post
  async addPost(title, location, description,startDate, endDate, academic, image, type) {
    let today = moment().format();
    let date = new Date(today);

    console.log("Image: ", image);

    console.log("Academics: ", academic);
    let keys = Object.keys(academic);
    let imageURL;
    
    if(image) {
      let filePath = await this.uploadImage("post", image);
      imageURL = await this.downloadImage(filePath);
    } else imageURL = "No image";
    console.log("Image URL: ", imageURL);
    
    for( var i = 0; i < keys.length; i++) {
      let count  = keys[i];

      let numeric = Math.random().toString().replace('0.', '').substring(0,2);
      let timestamp = new Date().getTime().toString().substring(5, 13);
      let id = numeric+timestamp;

      this.fireDatabase.list('/post').push({
        pID: parseInt(id),
        pTitle: title,
        pLocation: location,
        pStart: startDate.toString(),
        pEnd: endDate.toString(),
        pDescription: description,
        pPicture: imageURL,
        pDatetime: date.toString(),
        pLike: 0,
        pType: type,
        cID: this.userInfo["id"],
        acID:  parseInt(academic[count])
      });
    }

    return true;
  }

  //Updates Events and Quotes Posts
  async updatePost(id, title, location, startDate, endDate, description, image, change) {
    console.log("Info: ", id, title, location, startDate, endDate, description, image, change);
    var found = true;
    var ref=this.fireDatabase.list('post');

    let imageURL;
    
    if(image && change) {
      let filePath = await this.uploadImage("post", image);
      imageURL = await this.downloadImage(filePath);
    } else if(!change){
      imageURL = image;
    }else imageURL = "No image";

    ref.snapshotChanges(['child_added'])
    .subscribe(actions => {
      var keysPost = Object.keys(actions);
      var postTable = actions;
      for(var y = 0; y < keysPost.length; y++) {
        var countP = keysPost[y];
        var postKey = postTable[countP].key;
        var post = postTable[countP].payload.val();
        var postID = post.pID;

        if(postID ==  id) {
          ref.update(postKey, { pTitle: title,
                                pLocation: location,
                                pStart: startDate.toString(),
                                pEnd: endDate.toString(),
                                pDescription: description,
                                pPicture: imageURL}).then(() => {
                                  console.log("%cSuccessfully updated post!",'color: black; background: yellow; font-size: 16px');
                                });
        }
      }
    });
    return Promise.resolve(found);
  }

  deletePost(id) {
    var ref=this.fireDatabase.list('post');

    ref.snapshotChanges(['child_added'])
    .subscribe(actions => {
      var keysPost = Object.keys(actions);
      var postTable = actions;
      for(var y = 0; y < keysPost.length; y++) {
        var countP = keysPost[y];
        var postKey = postTable[countP].key;
        var post = postTable[countP].payload.val();
        var postID = post.pID;

        if(postID ==  id) {
          ref.remove(postKey);
          console.log("%cSuccessfully deleted post!", "color: white; background: violet; font-size: 10px");
        }
      }
    });
  }

  async likePost(postID) {
    let numeric = Math.random().toString().replace('0.', '').substring(0,2);
    let timestamp = new Date().getTime().toString().substring(5, 13);
    const id = numeric+timestamp;
    console.log(timestamp+" ? "+numeric);

   let posts = await this.fetchAllNodesBySnapshot("post");
   let ref = this.fireDatabase.list('post');

   let keys = Object.keys(posts);
   for(let i = 0; i < keys.length; i++) {
     let count = keys[i];
     console.log(postID +"? "+posts[count].payload.val().pID);
     if(posts[count].payload.val().pID === postID) {
        let addLike = posts[count].payload.val().pLike + 1
        ref.update(posts[count].key, { pLike: addLike });
        this.fireDatabase.list('/like').push({
          "lID": parseInt(id),
          "pID": postID,
          "sID": parseInt(this.userInfo["id"])
        });
       console.log("Liked!");
     }
   }
  }

  async unlikePost(postID) {
   let likes = await this.fetchAllNodesBySnapshot("like");
   let posts = await this.fetchAllNodesBySnapshot("post");
    console.log(likes +" ? "+ posts);
   let refLike = this.fireDatabase.list('like');
   let refPost = this.fireDatabase.list('post');

   let keysLike = Object.keys(likes);
   let keysPost = Object.keys(posts);

   for(let a = 0; a < keysLike.length; a++) {
     let countLike = keysLike[a];
     for(let b = 0; b < keysPost.length; b++) {
        let countPost = keysPost[b];
        console.log(likes[countLike].payload.val() +" ? "+ posts[countPost].payload.val());
        if(likes[countLike].payload.val().pID === posts[countPost].payload.val().pID &&
            posts[countPost].payload.val().pID === postID) {
                let minusLike = posts[countPost].payload.val().pLike - 1
                refPost.update(posts[countPost].key, { pLike: minusLike });
                refLike.remove(likes[countLike].key);
                console.log("Unliked!");
        }
     }
   }

  }

  /*********************/
  /**** P E O P L E ****/
  /*********************/
  async fetchListStudent(students, filter: Boolean, unit) {
    let studentList = [];
    let academics = await this.fetchAllNodesByTableInDatabase("academic");

    students.forEach(student => {
      academics.forEach(async academic => {
        let push = false;
        if(student["acID"] === academic["acID"] &&  !filter) 
          push = true;

        if(student["acID"] === academic["acID"] &&  filter && academic["acID"] === unit)
          push = true;

        if(await push) {
          let name = student["sLastName"] +", "+ student["sFirstName"];
          studentList.push({
            id: student["sID"],
            name: name,
            academic: academic["acCode"],
            picture: student["sPicture"]        
          })
        }

      })
    })

    return await studentList;
  }

  async fetchListCounselor(counselors, filter: Boolean, unit) {
    let counselorList = [];
    let academics = await this.fetchAllNodesByTableInDatabase("academic");

    counselors.forEach(async counselor => {
      let push = false;
      let academicList = []; //Handles all units of counselor
      academics.forEach(academic => {
        if(counselor["cID"] === academic["cID"]) {
          academicList.push({
            id: academic["acID"],
            code: academic["acCode"]
          })
        }
      })

      if(!filter) push =true;

      if(filter) {
        academicList.forEach(listUnit => {
          if(listUnit["id"] === unit) push = true;
        })
      }

      if(await push) {
        let name = counselor["cLastName"] +", "+ counselor["cFirstName"];

        counselorList.push({
          id: counselor["cID"],
          name: name,
          academic: academicList,
          picture: counselor["cPicture"]        
        })
      }
      

    })

    console.log("Counselors: ", counselorList);
    return await counselorList
  }

  async fetchPersonProfile(id, accounts, type) {
    let profile = [];
    let academics = await this.fetchAllNodesByTableInDatabase("academic");

    accounts.forEach(account => {
      if(type === "Student") {
        if(account["sID"] === id) { //Account Found
          let academicUnit = [];
          let name = account["sFirstName"] + " " + account["sLastName"];
          academics.forEach(async academic => {
            if(academic["acID"] === account["acID"]) {
              academicUnit.push({
                id: academic["acID"],
                name: academic["acName"]
              });
            }
          })

          profile.push({
            id: account["sID"],
            name: name,
            picture: account["sPicture"],
            status: account["sStatus"],
            academic: academicUnit
          });
        }
      } else { //If Counselor or GTD Head
        if(account["cID"] === id) { //Account Found
          let academicUnit = [];
          let name = account["cFirstName"] + " " + account["cLastName"];

          academics.forEach(async academic => {
            if(academic["cID"] === account["cID"]) {
              academicUnit.push({
                id: academic["acID"],
                name: academic["acName"]
              });
            }
          })
          
          profile.push({
            id: account["cID"],
            name: name,
            number: account["cNumber"],
            picture: account["cPicture"],
            status: account["cStatus"],
            academic: academicUnit
          });
        }
      }
    })

    return profile;
  }

  updateStudentInfo(id, unit, status) {
    let ref=this.fireDatabase.list('student');
    ref.snapshotChanges(["child_added"])
      .subscribe(students => {

        let keys = Object.keys(students);

        for( var i = 0; i < keys.length; i++) {
          let count = keys[i];

          if(students[count] != undefined) {
            let key = students[count].key;
            let studentID = students[count].payload.val().sID;
  
            console.log(id, " ? ", studentID);
            if(id === studentID) {
              ref.update(key, { acID: unit, sStatus: status  }); 
              console.log("Updated!");
            }
          }
          
        }
      })

      return Promise.resolve(); 
  }

  /*********************/
  /*** A P P O I N T ***/
  /*********************/
  async fetchAppointmentsOfCurrentMonth(type, id, appointments, month, year) {
    let currentAppointments = [];
    let keys = Object.keys(appointments);
    console.log(appointments);
    let dateFormatSchedule;
    let scheduleMonth;
    let scheduleYear;

    for(var i = 0; i < keys.length; i++) {
      let count = keys[i];
      let counselor = appointments[count].cID;
      let student = appointments[count].sID;
      let status = appointments[count].aStatus;

      if(type != "Student") {
        if(counselor == id) {
          dateFormatSchedule = new Date(appointments[count].aSchedule);
          scheduleMonth = dateFormatSchedule.getMonth();
          scheduleYear = dateFormatSchedule.getFullYear();
    
          if( scheduleMonth === month && scheduleYear === year 
                && status !== "Pending")
            currentAppointments.push(appointments[count]);
        }
      } else { //If the type of Account belongs to a student user
        if(student == id) {
          dateFormatSchedule = new Date(appointments[count].aSchedule);
          scheduleMonth = dateFormatSchedule.getMonth();
          scheduleYear = dateFormatSchedule.getFullYear();
    
          if( scheduleMonth === month && scheduleYear === year 
            && status !== "Pending")
            currentAppointments.push(appointments[count]);
        }
      }
    }

    currentAppointments.sort(function(a,b) {
      if(a.aSchedule < b.aSchedule) { return -1; }
      if(a.aSchedule > b.aSchedule) { return 1; }
      return 0;
    });

    console.log("Appointments: ", currentAppointments);
    return currentAppointments;
  }

  async fetchAppointmentsOfDate(id, type, date, appointments) {
    let appointmentsOfDate = [], schedule;
    let keys = Object.keys(appointments);

    console.log("insidie: ", id, type, date, appointments);

    for( let i = 0; i < keys.length; i++) {
      let count = keys[i];
      console.log("Status: ",appointments[count].aStatus  );
      
      if(appointments[count].aStatus !== "Pending" && appointments[count].aStatus !== "Finish") {
        if(type != "Student") {
          let counselor = appointments[count].cID;
          if(id === counselor) {
            schedule = new Date(appointments[count].aSchedule);
            if(date.toDateString() == schedule.toDateString())
              appointmentsOfDate.push(appointments[count]);
          }
        } else {
          let student = appointments[count].sID;
          if(id === student) {
            schedule = new Date(appointments[count].aSchedule);
            if(date.toDateString() == schedule.toDateString())
              appointmentsOfDate.push(appointments[count]);
          }
        }
      }

     
    }


    appointmentsOfDate.sort(function(a,b) {
      if(a.aSchedule < b.aSchedule) { return -1; }
      if(a.aSchedule > b.aSchedule) { return 1; }
      return 0;
    });
    console.log("Selected Date Appointments:", appointmentsOfDate);
    return appointmentsOfDate;
  }

  async fetchAppointmentsForNotification(appointments){
    let appointmentList = [];

    let counselors = await this.fetchAllNodesByTableInDatabase("counselor");
    let students = await this.fetchAllNodesByTableInDatabase("student");

    appointments.forEach(async appointment => {
      let picture, name, push = false;
      console.log("Status: ", appointment["aStatus"]);
      if(this.userInfo["type"] === "Student") {
        if(appointment["sID"] === this.userInfo["id"] && appointment["aStatus"] !== "Pending") {
          console.log("Found");
          push = true;

          counselors.forEach(counselor => {
            if(appointment["cID"] === counselor["cID"]){
              picture = counselor["cPicture"];
              name = counselor["cFirstName"] + " " + counselor["cLastName"];
            }
          })
        }
      }else{
        if(appointment["cID"] === this.userInfo["id"] && appointment["aStatus"] === "Pending") {
          console.log("Found");
          push = true;

          students.forEach(student => {
            if(appointment["sID"] === student["sID"]){
              picture = student["sPicture"];
              name = student["sFirstName"] + " " + student["sLastName"];
            }
          })
        }
      }

      if(push) {
        appointmentList.push({
          id: appointment["aID"],
          picture: picture,
          name: name,
          status: appointment["aStatus"],
          datetime: appointment["aDatetime"]
        })
      }
    });

    console.log("Fetched Appointment: ", appointmentList);
    return await appointmentList;
  }

  //Gets the student name, counselor name, concern name and academic name
  async filterAppointmentsOfDate(appointments : any[]) {
    let filteredAppointments = [];
    const counselors = await this.fetchAllNodesByTableInDatabase("counselor");
    const students = await this.fetchAllNodesByTableInDatabase("student");
    const concerns = await this.fetchAllNodesByTableInDatabase("concern");
    const academics = await this.fetchAllNodesByTableInDatabase("academic");

    console.log("Arrays: ",appointments, counselors, concerns, students);

    appointments.forEach(appointment => {
        let sName, sPicture, cName, cPicture,venue, coName, matchAcademic:any;

        students.forEach(student => {
          if(student["sID"] === appointment["sID"]){
            sName = student["sFirstName"] + " " + student["sLastName"];
            sPicture = student["sPicture"];

            if(this.userInfo["type"] !== "Student") {
              academics.forEach(async academic => {
                if(academic["acID"] === student["acID"]) {
                  matchAcademic = academic["acCode"];
                }
              })
            }
          }
        });

        counselors.forEach(counselor => {
          if(counselor["cID"] === appointment["cID"]){
            cName = counselor["cFirstName"] + " " + counselor["cLastName"];
            cPicture = counselor["cPicture"];

            if(this.userInfo["type"] === "Student") {
              let tempAcademic = [];
              academics.forEach(academic => {
                if(academic["cID"] === counselor["cID"]) {
                  console.log("Code: ", academic["acCode"], " == ", academic);
                  tempAcademic.push({code : academic["acCode"]});
                }
              });
              matchAcademic = tempAcademic;
            }
          }
        });

        concerns.forEach(concern => {
          if(concern["coID"] === appointment["coID"])
            coName = concern["coName"];
        });

        academics.forEach(academic => {
          if(academic["acID"] === appointment["acID"]) {
            venue = academic["acName"];
            console.log("Found ", venue);
          }
        })

        let hour = new Date(appointment["aSchedule"]).getHours();
        let minute = new Date(appointment["aSchedule"]).getMinutes();
        let minuteString = (minute < 10 ? '0':'') + minute;
        let meridian;
        if(hour < 12) meridian = "AM";
        if(hour >= 12) {
          meridian = "PM";
          hour = hour - 12;
        }
        if(hour === 24 || hour === 0) hour = 12;

        let hourString = (hour < 10 ? '0':'')+hour;

        let time = hourString+":"+minuteString;
        
        filteredAppointments.push({
            id: appointment["aID"],
            venue: venue,
            schedule: appointment["aSchedule"],
            time:time,
            meridian: meridian,
            description: appointment["aDescription"],
            student: sName,
            studentPhoto: sPicture,
            counselor: cName,
            counselorPhoto: cPicture,
            concern:coName,
            academic: matchAcademic
        });
    });

    filteredAppointments.sort(function(a,b) {
      if(a.schedule < b.schedule) { return -1; }
      if(a.schedule > b.schedule) { return 1; }
      return 0;
    });
    console.log("Filtered Appointments: ", filteredAppointments);
    return filteredAppointments;
  }

  //Gets all academic unit from a counselor to display as venue
  fetchAppointmentVenues(id) {
    let venue = [];

    let list = this.fireDatabase.list<Item>('academic');
    let item = list.valueChanges();

    return new Promise((resolve) => {
      item.subscribe( academic => {
        let keys = Object.keys(academic);
        console.log("Academics: ", academic);
  
        for(var i = 0; i < keys.length; i++) {
          let count = keys[i];
          let counselor = academic[count].cID;
  
          if(counselor == id) {
            venue.push(academic[count]);
          }
        }

        venue.sort(function(a,b) {
          if(a.acCode < b.acCode) { return -1; }
          if(a.acCode > b.acCode) { return 1; }
          return 0;
        });
        console.log("Venues: ", venue);
        resolve(venue);
      })
    })//End of Promise
  }

  fetchAppointmentConcerns() {
    let list = this.fireDatabase.list<Item>('concern');
    let item = list.valueChanges();

    return new Promise((resolve) => {
      item.subscribe( concern => {
        resolve(concern);
      })
    }) //End of promise
  }

  async filterAppointmentDetails(id, appointments) { //Fetches and fills other details
    let details = [];
    let students = await this.fetchAllNodesByTableInDatabase("student");
    let academics = await this.fetchAllNodesByTableInDatabase("academic");
    appointments.forEach(appointment =>{
      if(id === appointment["aID"]) {
        students.forEach(student => {
          if(appointment["sID"] === student["sID"]){
            let venue;
            let name = student["sFirstName"]+" "+student["sLastName"];

            academics.forEach(academic => {
              if(appointment["acID"] === academic["acID"])
                venue = academic["acName"];
            })

            details.push({
              id: appointment["aID"],
              studentName: name,
              sID: student["sID"],
              cID: appointment["cID"],
              schedule: appointment["aSchedule"],
              venue: venue
            });
          }
        })
      }
    })
    
    return Promise.resolve<any[]>(details[0]);
  }

  async fetchAppointmentForNotificationInfo(id, appointments) {
    let appointmentInfo = [];

    let concerns = await this.fetchAllNodesByTableInDatabase("concern");
    let counselors = await this.fetchAllNodesByTableInDatabase("counselor");
    let students = await this.fetchAllNodesByTableInDatabase("student");
    let academics = await this.fetchAllNodesByTableInDatabase("academic");

    appointments.forEach(async appointment => {
      let picture, name, coName, academicList = [], push = false;

      if(appointment["aID"] === id && this.userInfo["type"] === "Student") {
        push = true;

        counselors.forEach(async counselor => {
          if(appointment["cID"] === counselor["cID"]) {
            picture = counselor["cPicture"];
            name = counselor["cFirstName"]+" "+counselor["cLastName"];


            academics.forEach(academic => {
              if(academic["cID"] === counselor["cID"]) {
                academicList.push({
                  code: academic["acCode"]
                })
              }
            })
          }
        })
      } else if(appointment["aID"] === id && this.userInfo["type"] !== "Student") {
        push = true;

        students.forEach(async student => {
          if(appointment["sID"] === student["sID"]) {
            picture = student["sPicture"];
            name = student["sFirstName"]+" "+student["sLastName"];

            academics.forEach(academic => {
              if(academic["acID"] === student["acID"]) {
                academicList.push({
                  code: academic["acCode"]
                })
              }
            })
          }
        })
      }

      if(push) {
        
        concerns.forEach(concern => {
          if(concern["coID"] === appointment["coID"])
            coName = concern["coName"];
        });
        let venue;
        academics.forEach(academic => {
          if(appointment["acID"] === academic["acID"]) venue = academic["acName"];
        })

        appointmentInfo.push({
          id: appointment["aID"],
          picture: picture,
          name: name,
          academic: academicList,
          schedule: appointment["aSchedule"],
          description: appointment["aDescription"],
          venue: venue,
          concern: coName,
          sID: appointment["sID"],
          cID: appointment["cID"]
        })
      }
    })

    appointmentInfo = await appointmentInfo[0];
    return appointmentInfo;
  }

  async addAppointment(appointment) {
    console.log("Setting Appointment");

    this.fireDatabase.list('/appointment').push(appointment);
    return true;
  }

  async appointmentConfirmation(id) {
    let ref = this.fireDatabase.list("appointment");

    ref.snapshotChanges(['child_added']).subscribe(appointments => {
      let keys = Object.keys(appointments);

      for(let i = 0; i < keys.length; i++) {
        let count = keys[i];

        if(appointments[count].payload.val().aID === id) {
          let appointment = appointments[count].payload.val();
          
          ref.update(appointments[count].key, { 
            aStatus: "Accepted"
          }).then(()=> {
            console.log("Confirmed!");
          });
        }
      }
    }, error => console.log(error));
  }

  async fetchAppointment(id) {
    let appointments = await this.fetchAllNodesByTableInDatabase("appointment");
    let appointmentInfo = [];

    appointments.forEach(appointment => {
      if(appointment["aID"] === id) {
        console.log("FOUND!");
        appointmentInfo.push({
          id: appointment["aID"],
          schedule: appointment["aSchedule"],
          sID: appointment["sID"],
          cID: appointment["cID"]
        });
      }
    })

    console.log("Appointment Details: ", appointmentInfo);
    return await appointmentInfo;
  }

  async rescheduleAppointment(id, schedule, venue) {
    let ref = this.fireDatabase.list("appointment");

    ref.snapshotChanges(['child_added']).subscribe(appointments => {
      let keys = Object.keys(appointments);

      for(let i = 0; i < keys.length; i++) {
        let count = keys[i];

        if(appointments[count].payload.val().aID === id) {
          let appointment = appointments[count].payload.val();
          
          ref.update(appointments[count].key, { 
            aSchedule: schedule.toString(),
            aVenue: venue
          }).then(()=> {
            console.log("Rescheduled!");
          });
        }
      }
    }, error => console.log(error));
  }

  async finishAppointment(appointment) {
    let ref = this.fireDatabase.list("appointment");

    ref.snapshotChanges(['child_added']).subscribe(appointments => {
      let keys = Object.keys(appointments);

      for(let i = 0; i < keys.length; i++) {
        let count = keys[i];

        if(appointments[count].payload.val().aID === appointment["id"]) {
          let appointment = appointments[count].payload.val();
          
          ref.update(appointments[count].key, { 
            aStatus: "Finished"
          }).then(()=> {
            console.log("Finished!");
          });
        }
      }
    }, error => console.log(error));

    return;
  }

  /*********************/
  /****** C H A T ******/
  /*********************/
  async fetchChats(messages1) {
    let chatList = [];
    let messages2 = messages1;
    let counselors = await this.fetchAllNodesByTableInDatabase("counselor");
    let students = await this.fetchAllNodesByTableInDatabase("student");

    console.log("Chat List: ", chatList);
    await messages1.forEach(async message1 => {
      let duplicate = false;
      let datetime, description, recipientName, recipientPicture, push = false;

      if(this.userInfo["type"] === "Student") {

        if(message1["sID"] === this.userInfo["id"]) {

          chatList.forEach(chat => {
            if(chat["cID"] === message1["recipientID"]) {
              console.log("Duplicate!");
              duplicate = true;
            }
          })

          if(!duplicate) {
            console.log("Pushing...");

            messages2.forEach(async message2 => {
              if(message2["cID"] === message1["cID"]) {
                datetime = new Date(message2["mDatetime"]);
                description = message2["mDescription"];
                console.log("Info: ", datetime, description);
              }
            })

            counselors.forEach(counselor => {
              if(counselor["cID"] === message1["cID"]) {
                recipientName = counselor["cLastName"] +", "+ counselor["cFirstName"];
                recipientPicture = counselor["cPicture"];
              }
            })

            console.log("Pushed!");
            chatList.push({
              id: message1["mID"],
              name: recipientName,
              picture: recipientPicture,
              description: description,
              datetime: datetime,
              recipientID: message1["cID"]
            })
          }
        }
      } else { //Counselor or GTD Head
        if(message1["cID"] === this.userInfo["id"]) {
          
          chatList.forEach(chat => {
            if(chat["sID"] === message1["recipientID"]) {
              console.log("Duplicate!");
              duplicate = true;
            }
          })

          if(!duplicate) {
            console.log("Pushing...");

            messages2.forEach(async message2 => {
              if(message2["sID"] === message1["sID"]) {
                datetime = new Date(message2["mDatetime"]);
                description = message2["mDescription"];
                console.log("Info: ", datetime, description);
              }
            })

            students.forEach(student => {
              if(student["sID"] === message1["sID"]) {
                recipientName = student["sLastName"] +", "+ student["sFirstName"];
                recipientPicture = student["sPicture"];
              }
            })

            console.log("Pushed!");

            let time = this.convertMessageDate(datetime);
            chatList.push({
              id: message1["mID"],
              name: recipientName,
              picture: recipientPicture,
              description: description,
              datetime: datetime,
              recipientID: message1["sID"]
            })
          }
        }
      }
    })

    await chatList.sort(function(a,b) {
      if(a.datetime < b.datetime) { return -1; }
      if(a.datetime > b.datetime) { return 1; }
      return 0;
    });
    return chatList;
  }

  async fetchRecipient(person, accounts) {
    let recipient = [];
    console.log("Person: ", person);
    console.log("Accounts: ", accounts);
    accounts.forEach(account => {
      let name;

      if(this.userInfo["type"] === "Student") {
        if(account["cID"] === person) {
          name = account["cFirstName"] + " " + account["cLastName"];
          recipient.push({
            id: account["cID"],
            picture: account["cPicture"],
            name: name
          })
        }
      } else {
        if(account["sID"] === person) {
          name = account["sFirstName"] + " " + account["sLastName"];
          recipient.push({
            id: account["sID"],
            picture: account["sPicture"],
            name: name
          })
        }
      }
    })

    console.log("Recipient Info: ", recipient);

    return recipient[0];
  }

  fetchMessages(recipientID, messages) {
    let messageList = [];
    let account;
    if(this.userInfo["type"] === "Student")  account = "Student" 
    else account ="Counselor"

    messages.forEach( message => {
      //Message filter here...
      let type;

      if(this.userInfo["type"] === "Student") {
        if(message["sID"] === this.userInfo["id"] && message["cID"] === recipientID) {
          

          if(message["mType"] === account) {
            type = "Sender";
          } else {
            type = "Recipient"
          }
          let date = this.convertMessageDate(message["mDatetime"]);

          messageList.push({
            id: message["mID"],
            message: message["mDescription"],
            datetime: date,
            type: type
          })
        }
      } else {
        if(message["cID"] === this.userInfo["id"] && message["sID"] === recipientID) {
          let type;
          if(message["mType"] === account) {
            type = "Sender";
          } else {
            type = "Recipient"
          }

          let date = this.convertMessageDate(message["mDatetime"]);

          messageList.push({
            id: message["mID"],
            message: message["mDescription"],
            datetime: message["mDatetime"],
            type: type
          })
        }
      }
    })

    return messageList;
  }

  convertMessageDate(messageDatetime) {
    console.log("Datetime passed: ", messageDatetime);
    let datetime = new Date(messageDatetime);

    

    let month = datetime.getMonth();
    let day = datetime.getDate();
    let year = datetime.getFullYear();
    let hour = datetime.getHours();
    let minute = datetime.getMinutes();

    let monthString = (month < 10 ? '0':'') + month;
    let dayString = (day < 10 ? '0':'') + day;
    let minuteString = (minute < 10 ? '0':'') + minute;

      let meridian;
      if(hour < 12) meridian = "AM";
      if(hour >= 12) {
        meridian = "PM";
        hour = hour - 12;
      }
      if(hour === 24 || hour === 0) hour = 12;

      let hourString = (hour < 10 ? '0':'')+hour;

      let time = hourString+":"+minuteString+" "+meridian;
      let stringDate = monthString+"/"+day+"/"+year+" "+time;

    return stringDate;
  }

  async addMessage(counselor, student, message) {
    let numeric = Math.random().toString().replace('0.', '').substring(0,2);
    let timestamp = new Date().getTime().toString().substring(5, 13);
    const id = numeric+timestamp;
    console.log(timestamp+" ? "+numeric);

    let type, datetime = new Date(moment().format());

    if(this.userInfo["type"] === "Student") {
      type = "Student";
    } else {
      type = "Counselor"
    }

    this.fireDatabase.list('/message').push({
      mID: parseInt(id),
      mDescription: message,
      mType: type,
      mDatetime: datetime.toString(),
      sID: student,
      cID: counselor
    })

    return;
  }

  /*********************/
  /** F E E D B A C K **/
  /*********************/
  async searchFeedback(feedbacks, appointments, id) {
    let foundFeedback = false, foundAppointment = false;

    feedbacks.forEach(feedback => {
      if(feedback["aID"] === id) foundFeedback = true;
    })

    appointments.forEach(appointment => {
      
      if(appointment["aID"] === id && appointment["aStatus"] === "Finished") foundAppointment = true;
    })

    console.log(foundFeedback , " ? ", foundAppointment);

    let result = false;
    if (!foundFeedback && foundAppointment) result = true;

    return <Boolean> result;
  }

  async addFeedback(appointmentID, rate, description) {
    let numeric = Math.random().toString().replace('0.', '').substring(0,2);
    let timestamp = new Date().getTime().toString().substring(5, 13);
    const id = numeric+timestamp;
    console.log(timestamp+" ? "+numeric);

    let datetime = new Date(moment().format());

    if(!description) description = "None"
    
    this.fireDatabase.list('/feedback').push({
      fID: parseInt(id),
      fDescription: description,
      fRate: parseInt(rate),
      fDatetime: datetime.toString(),
      sID: this.userInfo["id"],
      aID: appointmentID
    }).then(() => console.log("Added feedback!"));

    return;
  }

  /*********************/
  /**** O T H E R S ****/
  /*********************/
  uploadImage(folder, image) {
    console.log("Saving photo...");
    let alphanumeric = Math.random().toString(36).replace('0.', '').substring(0,5); 
    let timestamp = new Date().getTime().toString();
    let name = "IMG_"+alphanumeric+"_" +timestamp+".jpeg";
    
    const filePath = folder+"/"+ name;
    const ref = this.fireStorage.ref(filePath);
    console.log("Created file path: ", filePath);

    return new Promise((resolve) => {
      ref.putString(image, 'data_url').then(() => {
        console.log("Success");
        resolve(filePath);
      }).catch( err => console.log("Failed to upload"));
    });
  }

  downloadImage(filePath) {
    var pathRef = firebase.storage().ref();
    console.log("Downloading file: ", filePath);

    return new Promise((resolve) => {
        pathRef.child(filePath).getDownloadURL()
        .then(function(url) {
          console.log("Success!");
          resolve(url);
        }).catch( error => {
          console.log("Error: ", JSON.stringify(error));
        });
    });
  }

  fetchCurrentDate(complete) {
    var date;
    this.currentDate();

    if (complete) {
      date = this.currentDateMDYhmA;
    } else {
      date = this.currentDateMDY;
    }

    return Promise.resolve(date);
  }

  convertDate(date) {
    let datetime = new Date(date);

    let month = datetime.getMonth();
    let day = datetime.getDate();
    let year = datetime.getFullYear();
    let hour = datetime.getHours();
    let minute = datetime.getMinutes();

    let monthString = this.findMonth(month);

    let minuteString = (minute < 10 ? '0':'') + minute;
      let meridian;
      if(hour < 12) meridian = "AM";
      if(hour >= 12) {
        meridian = "PM";
        hour = hour - 12;
      }
      if(hour === 24 || hour === 0) hour = 12;

      let hourString = (hour < 10 ? '0':'')+hour;

      let time = hourString+":"+minuteString+" "+meridian;
      let stringDate = monthString+" "+day+", "+year+" "+time;

      return stringDate;
  }

  currentDate() {
    var date = new Date();

    var month = date.getMonth()
    var day = date.getDate();
    var year = date.getFullYear();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var meridian;

    if( typeof month != 'string') {
      //Convert month into word
      month = this.findMonth(month);
    }

    //Identify meridian of hour
    if (hour < 12) {
      meridian = "AM";
    } else {
      hour -= 12;
      meridian = "PM";
    }

    if (hour == 0) hour = 12;

    //Sets all variables to current date
    this.currentDateMDYhmA = month + " " + day + ", " + year + " " 
    + hour + ":" + minute +  " " + meridian;
    this.currentDateMDY = month + " " + day + ", " + year;

    console.log("Current Date: ", this.currentDateMDYhmA);
  }

  findMonth(month) {
    var returnName;
    var monthArr = [];

    monthArr[1] = "January";
    monthArr[2] = "February";
    monthArr[3] = "March";
    monthArr[4] = "April";
    monthArr[5] = "May";
    monthArr[6] = "June";
    monthArr[7] = "July";
    monthArr[8] = "August";
    monthArr[9] = "September";
    monthArr[10] = "October";
    monthArr[11] = "November";
    monthArr[12] = "December";

    for (var i = 1; i <= monthArr.length; i++) {
      if(i == month){
        returnName=monthArr[i+1];
      }
    }

    return returnName;
  }

}
