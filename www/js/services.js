angular.module('ionic-datepicker.service', [])

  .service('IonicDatepickerService', function () {
    this.monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    this.getYearsList = function (from, to) {
      console.log(from, to)
      var yearsList = []
      var minYear = 1900
      var maxYear = new Date().getFullYear() + 1

      minYear = from ? new Date(from).getFullYear() : minYear
      maxYear = to ? new Date(to).getFullYear() : maxYear

      for (var i = maxYear; i >= minYear; i--) {
        yearsList.push(i)
      }

      return yearsList
    }
  })

angular.module('kidney.services', ['ionic', 'ngResource'])
// 配置图片白名单
.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|weixin|wxlocalresource):/)
    // 其中 weixin 是微信安卓版的 localId 的形式，wxlocalresource 是 iOS 版本的 localId 形式
}])

// 本地存储函数
.factory('Storage', ['$window', function ($window) {
  return {
    set: function (key, value) {
      $window.localStorage.setItem(key, value)
    },
    get: function (key) {
      return $window.localStorage.getItem(key)
    },
    rm: function (key) {
      $window.localStorage.removeItem(key)
    },
    clear: function () {
      $window.localStorage.clear()
    }
  }
}])
.constant('CONFIG', {
  crossKey: 'fe7b9ba069b80316653274e4',
  appKey: 'cf32b94444c4eaacef86903e',
  baseUrl: 'http://121.196.221.44:4060/api/v1/',
  baseUrl2: 'http://121.43.107.106:4060/api/v1/',
  baseTwoUrl: 'http://121.43.107.106:4060/api/v2/',
  mediaUrl: 'http://121.196.221.44:8055/',
  socketUrl: 'http://121.196.221.44:4060/chat',
  imgThumbUrl: 'http://121.196.221.44:8055/uploads/photos/resize',
  imgLargeUrl: 'http://121.196.221.44:8055/uploads/photos/',
  cameraOptions: {
    cam: {
      quality: 60,
      destinationType: 1,
      sourceType: 1,
      allowEdit: true,
      encodingType: 0,
      targetWidth: 1000,
      targetHeight: 1000,
      popoverOptions: false,
      saveToPhotoAlbum: false
    },
    gallery: {
      quality: 60,
      destinationType: 1,
      sourceType: 0,
      allowEdit: true,
      encodingType: 0,
      targetWidth: 1000,
      targetHeight: 1000
    }
  }
})

// 自定义函数
// 登录
.service('loginFactory', function (Storage) {
  var service = {}
  var flag = false
  var userid// 用户ID

  this.isLogin = function (user, pwd) {
    // 账户写死
    if (user == '13709553333' && pwd == '123') {
      userid = 'D201703240001'
      Storage.set('userid', userid)// 存储全局变量userid,通过本地存储
      flag = true
    }
    if (user == '13709553334' && pwd == '123') {
      userid = 'D201703240002'
      Storage.set('userid', userid)// 存储全局变量userid,通过本地存储
      flag = true
    }
    if (user == '18868800021' && pwd == '123') {
      userid = 'D201703240091'
      Storage.set('userid', userid)// 存储全局变量userid,通过本地存储
      flag = true
    }
    if (user == '18868800022' && pwd == '123') {
      userid = 'D201703240092'
      Storage.set('userid', userid)// 存储全局变量userid,通过本地存储
      flag = true
    }
    if (window.jmessage) {
      window.JMessage.login(user, user,
        function (response) {
          window.JMessage.username = user
            // gotoConversation();
        },
        function (err) {
          console.log(err)
            // JM.register($scope.useruserID, $scope.passwd);
        })
    }
    return flag
  }

  // return service;
})

// media文件操作 XJZ
.factory('fs', ['$q', '$cordovaFile', '$filter', function ($q, $cordovaFile, $filter) {
  return {
    mvMedia: function (type, fileName, ext) {
      return $q(function (resolve, reject) {
        if (type == 'voice') var path = cordova.file.externalRootDirectory
        else if (type == 'image') var path = cordova.file.externalCacheDirectory
        else reject('type must be voice or image')
        var time = new Date()
        var newName = $filter('date')(time, 'yyyyMMddHHmmss') + ext
        $cordovaFile.moveFile(path, fileName, cordova.file.dataDirectory, newName)
                  .then(function (success) {
                    // console.log(success);
                    resolve(success.nativeURL)
                  }, function (error) {
                    console.log(error)
                    reject(error)
                  })
      })
    }
  }
}])
// voice recorder XJZ
.factory('voice', ['$filter', '$q', '$ionicLoading', '$cordovaFile', 'CONFIG', 'Storage', 'fs', function ($filter, $q, $ionicLoading, $cordovaFile, CONFIG, Storage, fs) {
    // funtion audio(){};
  var audio = {}
  audio.src = ''
  audio.media = {}

  audio.record = function (receiver, onSuccess, onError) {
    return $q(function (resolve, reject) {
      if (audio.media.src) audio.media.release()
      var time = new Date()
      audio.src = $filter('date')(time, 'yyyyMMddHHmmss') + '.amr'
      audio.media = new Media(audio.src,
                function () {
                  console.info('recordAudio():Audio Success')
                  console.log(audio.media)
                  $ionicLoading.hide()

                  fs.mvMedia('voice', audio.src, '.amr')
                        .then(function (fileUrl) {
                          console.log(fileUrl)
                          resolve(fileUrl)
                            // window.JMessage.sendSingleVoiceMessage(receiver, fileUrl, CONFIG.appKey,
                            //     function(res) {
                            //         resolve(res);
                            //     },
                            //     function(err) {
                            //         reject(err)
                            //     });
                            // resolve(fileUrl.substr(fileUrl.lastIndexOf('/')+1));
                        }, function (err) {
                          console.log(err)
                          reject(err)
                        })
                },
                function (err) {
                  console.error('recordAudio():Audio Error')
                  console.log(err)
                  reject(err)
                })
      audio.media.startRecord()
      $ionicLoading.show({ template: '开始说话', noBackdrop: true})
    })
  }
  audio.stopRec = function () {
    audio.media.stopRecord()
  }
  audio.open = function (fileUrl) {
    if (audio.media.src)audio.media.release()
    return $q(function (resolve, reject) {
      audio.media = new Media(fileUrl,
                function (success) {
                  resolve(audio.media)
                },
                function (err) {
                  reject(err)
                })
    })
  }
  audio.play = function (src) {
    audio.media.play()
  }
  audio.stop = function () {
    audio.media.stop()
  }
  audio.sendAudio = function (fileUrl, receiver) {
        // return $q(function(resolve, reject) {
    window.JMessage.sendSingleVoiceMessage(receiver, cordova.file.externalRootDirectory + fileUrl, CONFIG.appKey,
            function (response) {
              console.log('audio.send():OK')
              console.log(response)
                // $ionicLoading.show({ template: 'audio.send():[OK] '+response,duration:1500});
                // resolve(response);
            },
            function (err) {
                // $ionicLoading.show({ template: 'audio.send():[failed] '+err,duration:1500});
              console.log('audio.send():failed')
              console.log(err)
                // reject(err);
            })
        // });
  }
  return audio
}])

.factory('jmapi', ['$http', 'JM', 'Doctor', '$q', 'jm', function ($http, JM, Doctor, $q, jm) {
    // var hs={
    //     'Authorization':'Basic Y2YzMmI5NDQ0NGM0ZWFhY2VmODY5MDNlOmJhYjI4M2NkOWQzMDY4ZTE5NDYwODgzMg==',
    //     'Content-Type':'application/json'
    // };
    // var host="https://api.im.jpush.cn/v1/";
    // function jmreq(method,resource,params){
    //     req={
    //         method:method,
    //         url:host+resource,
    //         headers:hs,
    //         data:params
    //     }
    //     return $http(req);
    // }
  return {
        // userCheck:function(userId){
        //     jmreq('GET','users/'+userId)
        //     .then(function(res){
        //         console.log(res);
        //     },function(err){
        //         console.error(err);
        //         if(err.data.error.code=='899002') return this.users(userId);
        //     });
        // },
    registerByPhone: function (phone) {
      return User.getUserId({username: phone})
                .then(function (data) {
                  if (data.UserId) return this.users(data.UserId)
                  return data
                }, function (err) {
                  return err
                })
    },
    users: function (userId) {
            // return jm.users({flag:'doctor',username:userId})
            // return Doctor.getDoctorInfo({userId:userId})
            //     .then(function(data){
      var d = {
        'username': userId,
        'password': JM.pGen(userId),
        'flag': 'doctor'
      }
      var arr = [d]
      return jm.users(d)
                // },function(err){
                //     return 'neterr';
                // });
            // Doctor.getDoctorInfo({userId:userId})
            // .then(function(data){
            //     var d={
            //         "username":userId,
            //         "password":JM.pGen(userId),
            //         "nickname":data.results.name
            //     }
            //     var arr=[d];
            //     return jmreq('POST','users/',arr);
            // },function(err){
            //     return null;
            // });
    },
    groups: function (owner, userArr, Gname, Gdesc) {
            // var owner = userArr[0];
            // userArr.splice(0,1);
      var d = {
        'owner_username': owner,
        'name': Gname,
        'members_username': userArr,
        'desc': Gdesc,
        'flag': 'doctor'
      }
      return jm.groups(d)
    },
    groupsMembers: function (gid, addArr, delArr) {
      var d = {
        'add': addArr,
        'remove': delArr,
        'groupId': gid,
        'flag': 'doctor'
      }
      return jm.groupsMembers(d)
    }
  }
}])
// jmessage XJZ
.factory('JM', ['Storage', '$q', 'Doctor', function (Storage, $q, Doctor) {
  var ConversationList = []
  var messageLIsts = {}

    // custom{
    //     contentStringMap:
    // }
    // text{
    //     text:

    // }
    // image{
    //     localThumbnailPath:

    // }
    // voice{
    //     duration:
    //     local_path:
    // }
    // var msgSample={
    //     contentType:'',
    //     fromID:'',
    //     fromName:'',
    //     fromUser:{

    //     },
    //     targetName:'',
    //     targetType:'',
    //     direct:'',
    //     status:'',
    //     diff:true,
    //     createTimeInMillis:'',
    //     newsType:'',
    //     content:{}
    // }
  function pGen (u) {
    return md5(u, 'kidney').substr(4, 10)
  }

  function checkIsLogin () {
    return $q(function (resolve, reject) {
      window.JMessage.getMyInfo(function (response) {
        console.log('user is login' + response)
        var myInfo = JSON.parse(response)
        window.JMessage.username = myInfo.userName
                // window.JMessage.nickname = myInfo.nickname;
                // window.JMessage.gender = myInfo.mGender;
                // usernameForConversation = myInfo.userName;
        resolve(myInfo.userName)
      }, function (response) {
        console.log('User is not login.')
        window.JMessage.username = ''
        window.JMessage.nickname = ''
        window.JMessage.gender = 'unknown'
        reject('not login')
      })
    })
        // console.log("checkIsLogin...");
  }

    // function getPushRegistrationID() {
    //     try {
    //         window.JPush.getRegistrationID(onGetRegistrationID);
    //         if (device.platform != "Android") {
    //             window.JPush.setDebugModeFromIos();
    //             window.JPush.setApplicationIconBadgeNumber(0);
    //         } else {
    //             window.JPush.setDebugMode(true);
    //         }
    //     } catch (exception) {
    //         console.log(exception);
    //     }
    // }

    // function updateUserInfo() {
    //     window.JMessage.getMyInfo(
    //         function(response) {
    //             var myInfo = JSON.parse(response);
    //             console.log("user is login" + response);
    //             window.JMessage.username = myInfo.userName;
    //             window.JMessage.nickname = myInfo.nickname;
    //             window.JMessage.gender = myInfo.mGender;
    //             $('#myInfoUsername').val(myInfo.userName);
    //             $('#myInfoNickname').val(myInfo.nickname);
    //             $('#myInfoGender').val(myInfo.gender);
    //         }, null);
    // }

    // function getUserDisplayName() {
    //     if (window.JMessage.nickname.length == 0) {
    //         return window.JMessage.username;
    //     } else {
    //         return window.JMessage.nickname;
    //     }
    // }

  function login (user, nick) {
    return $q(function (resolve, reject) {
      Doctor.getDoctorInfo({userId: user})
            .then(function (data) {
              console.log(user)
              console.log(pGen(user))
              if (window.JMessage) {
                window.JMessage.login(user, pGen(user),
                        function (response) {
                          window.JMessage.updateMyInfo('nickname', data.results.name)
                          window.JMessage.nickname = data.results.name
                          window.JMessage.username = user
                          resolve(user)
                        }, function (err) {
                          console.log(err)
                          register(user, data.results.name)
                            // reject(err);
                        })
              }
            }, function (err) {
              reject(err)
            })
    })
  }

  function register (user, nick) {
    return $q(function (resolve, reject) {
      window.JMessage.register(user, pGen(user),
                function (response) {
                  window.JMessage.login(user, pGen(user),
                    function (response) {
                        // 真实姓名
                      window.JMessage.updateMyInfo('nickname', nick)
                      window.JMessage.username = user
                      window.JMessage.nickname = nick
                      resolve(user)
                    }, function (err) {
                      console.log(err)
                      reject(err)
                    })
                    // console.log("login callback success" + response);
                    // resolve(user);
                },
                function (response) {
                  console.log('login callback fail' + response)
                  reject(response)
                }
            )
    })
  }

  function onGetRegistrationID (response) {
    console.log('registrationID is ' + response)
    Storage.set('jid', response)
        // $("#registrationId").html(response);
  }

  function getPushRegistrationID () {
    try {
      window.JPush.getRegistrationID(onGetRegistrationID)
      if (device.platform != 'Android') {
        window.JPush.setDebugModeFromIos()
        window.JPush.setApplicationIconBadgeNumber(0)
      } else {
        window.JPush.setDebugMode(true)
      }
    } catch (exception) {
      console.log(exception)
    }
  }

  function onOpenNotification (event) {
    console.log('index onOpenNotification')
    try {
      var alertContent
      if (device.platform == 'Android') {
        alertContent = event.alert
      } else {
        alertContent = event.aps.alert
      }
      alert('open Notification:' + alertContent)
    } catch (exception) {
      console.log('JPushPlugin:onOpenNotification' + exception)
    }
  }

  function onReceiveNotification (event) {
    console.log('index onReceiveNotification')
    try {
      var alertContent
      if (device.platform == 'Android') {
        alertContent = event.alert
      } else {
        alertContent = event.aps.alert
      }
      $('#notificationResult').html(alertContent)
    } catch (exception) {
      console.log(exception)
    }
  }

  function onReceivePushMessage (event) {
    try {
      var message
      if (device.platform == 'Android') {
        message = event.message
      } else {
        message = event.content
      }
      console.log(message)
      $('#messageResult').html(message)
    } catch (exception) {
      console.log('JPushPlugin:onReceivePushMessage-->' + exception)
    }
  }

  function newGroup (name, des, members, type) {
    return $q(function (resolve, reject) {
      window.JMessage.createGroup('abcde', 'fg', '',
            // window.JMessage.createGroup(name,des,
                function (data) {
                  console.log(data)
                    // members=$rootScope.newMember;
                  var idStr = []
                  for (var i in members) idStr.push(members[i].userId)
                  idStr.join(',')
                    // window.JMessage.addGroupMembers(groupId,idStr,
                  window.JMessage.addGroupMembers('22818577', 'user004,',
                        function (data) {
                          console.log(data)
                          upload()
                        }, function (err) {
                          $ionicLoading.show({ template: '失败addGroupMembers', duration: 1500 })
                          console.log(err)
                        })
                }, function (err) {
                  $ionicLoading.show({ template: '失败createGroup', duration: 1500 })
                  console.log(err)
                })
    })
  }

  function sendCustom (type, toUser, key, data) {
    return $q(function (resolve, reject) {
      if (type = 'single') {
        window.JMessage.sendSingleCustomMessage(toUser, data, key,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else if (type = 'group') {
        window.JMessage.sendGroupCustomMessage(toUser, data, key,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else {
        reject('wrong type')
      }
    })
  }
  function sendContact (type, toUser, data) {
    return $q(function (resolve, reject) {
      if (type = 'single') {
        window.JMessage.sendSingleCustomMessage(toUser, data, key,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else if (type = 'group') {
        window.JMessage.sendGroupCustomMessage(toUser, data, key,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else {
        reject('wrong type')
      }
    })
  }
  function sendEndl (type, toUser, data) {
    return $q(function (resolve, reject) {
      if (type = 'single') {
        window.JMessage.sendSingleCustomMessage(toUser, data, key,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else if (type = 'group') {
        window.JMessage.sendGroupCustomMessage(toUser, data, key,
                    function (data) {
                      resolve(data)
                    }, function (err) {
                      reject(err)
                    })
      } else {
        reject('wrong type')
      }
    })
  }
  return {
    init: function () {
      window.JPush.init()

      getPushRegistrationID()
    },
    login: login,
    pGen: pGen,
    sendCustom: sendCustom,
    newGroup: newGroup,
    register: register,
    pGen: pGen,
    checkIsLogin: checkIsLogin,
    getPushRegistrationID: getPushRegistrationID
  }
}])
// 获取图片，拍照or相册，见CONFIG.cameraOptions。return promise。xjz
.factory('Camera', ['$q', '$cordovaCamera', 'CONFIG', 'fs', function ($q, $cordovaCamera, CONFIG, fs) {
  return {
    getPicture: function (type) {
      return $q(function (resolve, reject) {
        $cordovaCamera.getPicture(CONFIG.cameraOptions[type]).then(function (imageUrl) {
              // file manipulation
          var tail = imageUrl.lastIndexOf('?')
          if (tail != -1) var fileName = imageUrl.slice(imageUrl.lastIndexOf('/') + 1, tail)
          else var fileName = imageUrl.slice(imageUrl.lastIndexOf('/') + 1)
          fs.mvMedia('image', fileName, '.jpg')
              .then(function (res) {
                console.log(res)
                // res: file URL
                resolve(res)
              }, function (err) {
                console.log(err)
                reject(err)
              })
        }, function (err) {
          console.log(err)
          reject('fail to get image')
        })
      })
    }
  }
}])

.factory('Data', ['$resource', '$q', '$interval', 'CONFIG', function ($resource, $q, $interval, CONFIG) {
  var serve = {}
  var abort = $q.defer()

  var Dict = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'dict'}, {
      getDiseaseType: {method: 'GET', params: {route: 'typeTWO'}, timeout: 100000},
      getDistrict: {method: 'GET', params: {route: 'district'}, timeout: 100000},
      getHospital: {method: 'GET', params: {route: 'hospital'}, timeout: 100000},
      getHeathLabelInfo: {method: 'GET', params: {route: 'typeOne'}, timeout: 100000},
      typeOne: {method: 'GET', params: {route: 'typeOne'}, timeout: 100000}
    })
  }

  var Nurse = function () {
    return $resource(CONFIG.baseTwoUrl + ':path/:route', {path: 'nurse'}, {
      getPatientsList: {method: 'GET', params: {route: 'patientsList'}, timeout: 100000},
      updatePatientsList: {method: 'POST', params: {route: 'bindingPatient'}, timeout: 100000}
    })
  }

  var Task = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'tasks'}, {
      changeTaskstatus: {method: 'POST', params: {route: 'status'}, timeout: 100000},
      changeTasktime: {method: 'POST', params: {route: 'time'}, timeout: 100000},
      insertTask: {method: 'POST', params: {route: 'taskModel'}, timeout: 100000},
      getUserTask: {method: 'GET', params: {route: 'task'}, timeout: 100000},
      updateUserTask: {method: 'POST', params: {route: 'task'}, timeout: 100000}
    })
  }

  var Compliance = function () {
    return $resource(CONFIG.baseUrl + ':path', {path: 'compliance'}, {
      getcompliance: {method: 'GET', params: {}, timeout: 100000},
      postcompliance: {method: 'POST', params: {}, timeout: 100000}
    })
  }

  var Counsel = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'counsel'}, {
      getCounsel: {method: 'GET', params: {route: 'counsels'}, timeout: 100000},
      questionaire: {method: 'POST', params: {route: 'questionaire'}, timeout: 100000},
      changeCounselStatus: {method: 'POST', params: {route: 'changeCounselStatus'}, timeout: 100000},
      getStatus: {method: 'GET', params: {route: 'status'}, timeout: 100000},
      changeStatus: {method: 'POST', params: {route: 'status'}, timeout: 100000}
    })
  }

  var Patient = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'patient'}, {
      getPatientDetail: {method: 'GET', params: {route: 'detail'}, timeout: 100000},
      getMyDoctors: {method: 'GET', params: {route: 'myDoctors'}, timeout: 10000},
      getDoctorLists: {method: 'GET', params: {route: 'doctors'}, timeout: 10000},
      getCounselRecords: {method: 'GET', params: {route: 'counselRecords'}, timeout: 10000},
      insertDiagnosis: {method: 'POST', params: {route: 'diagnosis'}, timeout: 10000},
      newPatientDetail: {method: 'POST', params: {route: 'detail'}, timeout: 10000},
      editPatientDetail: {method: 'POST', params: {route: 'editDetail'}, timeout: 10000}
    })
  }

  var Doctor = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'doctor'}, {
      postDocBasic: {method: 'POST', params: {route: 'detail'}, timeout: 100000},
      getPatientList: {method: 'GET', params: {route: 'myPatients'}, timeout: 100000},
      getDoctorInfo: {method: 'GET', params: {route: 'detail'}, timeout: 100000},
      getMyGroupList: {method: 'GET', params: {route: 'myTeams'}, timeout: 100000},
      getGroupPatientList: {method: 'GET', params: {route: 'teamPatients'}, timeout: 100000},
      getRecentDoctorList: {method: 'GET', params: {route: 'myRecentDoctors'}, timeout: 100000},
      editDoctorDetail: {method: 'POST', params: {route: 'editDetail'}, timeout: 10000},
      insertSchedule: {method: 'POST', params: {route: 'schedule'}, timeout: 10000},
      getSchedules: {method: 'GET', params: {route: 'schedules'}, timeout: 10000},
      deleteSchedule: {method: 'POST', params: {route: 'deleteSchedule'}, timeout: 10000},
      getSuspendTime: {method: 'GET', params: {route: 'suspendTime'}, timeout: 10000},
      insertSuspendTime: {method: 'POST', params: {route: 'suspendTime'}, timeout: 10000},
      deleteSuspendTime: {method: 'POST', params: {route: 'deleteSuspendTime'}, timeout: 10000},
      getPatientByDate: {method: 'GET', params: {route: 'myPatientsByDate'}, timeout: 10000},
      getDocNum: {method: 'GET', params: {route: 'numbers'}, timeout: 10000},
      getAliPayAccount: {method: 'GET', params: {route: 'AliPayAccount'}, timeout: 10000},
      editAliPayAccount: {method: 'POST', params: {route: 'AliPayAccount'}, timeout: 10000}
    })
  }

  var User = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'user'}, {
      register: {method: 'POST', skipAuthorization: true, params: {route: 'register', phoneNo: '@phoneNo', password: '@password', role: '@role'}, timeout: 100000},
      changePassword: {method: 'POST', skipAuthorization: true, params: {route: 'reset', phoneNo: '@phoneNo', password: '@password'}, timeout: 100000},
      logIn: {method: 'POST', skipAuthorization: true, params: {route: 'login'}, timeout: 10000},
      logOut: {method: 'POST', params: {route: 'logout', userId: '@userId'}, timeout: 100000},
      getUserId: {method: 'GET', skipAuthorization: true, params: {route: 'userID', username: '@username'}, timeout: 100000},
      sendSMS: {method: 'POST', skipAuthorization: true, params: {route: 'sms', mobile: '@mobile', smsType: '@smsType'}, timeout: 100000}, // 第一次验证码发送成功返回结果为”User doesn't exist“，如果再次发送才返回”验证码成功发送“
      verifySMS: {method: 'GET', skipAuthorization: true, params: {route: 'sms', mobile: '@mobile', smsType: '@smsType', smsCode: '@smsCode'}, timeout: 100000},
      getAgree: {method: 'GET', params: {route: 'agreement', userId: '@userId'}, timeout: 100000},
      updateAgree: {method: 'POST', params: {route: 'agreement'}, timeout: 100000},
            // getUserIDbyOpenId:{method:'GET',skipAuthorization: true,params:{route: 'getUserIDbyOpenId'}, timeout: 100000}, //20170619 后端删除该方法，与getUserID方法合并
      setOpenId: {method: 'POST', skipAuthorization: true, params: {route: 'unionid'}, timeout: 100000},
      getMessageOpenId: {method: 'GET', skipAuthorization: true, params: {route: 'openid'}, timeout: 100000},
      setMessageOpenId: {method: 'POST', skipAuthorization: true, params: {route: 'openid'}, timeout: 100000},
      One: {method: 'GET', params: {route: 'one'}, timeout: 10000}
    })
  }

  var Health = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'healthInfo'}, {
      createHealth: {method: 'POST', params: {route: 'healthInfo', userId: '@userId', type: '@type', time: '@time', url: '@url', label: '@label', description: '@description', comments: '@comments'}, timeout: 100000},
      modifyHealth: {method: 'POST', params: {route: 'healthDetail', userId: '@userId', type: '@type', time: '@time', url: '@url', label: '@label', description: '@description', comments: '@comments', insertTime: '@insertTime'}, timeout: 100000},
      getHealthDetail: {method: 'GET', params: {route: 'healthDetail', userId: '@userId', insertTime: '@insertTime'}, timeout: 100000},
      getAllHealths: {method: 'GET', params: {route: 'healthInfos', userId: '@userId'}, timeout: 100000},
      deleteHealth: {method: 'POST', params: {route: 'deleteHealthDetail', userId: '@userId', insertTime: '@insertTime'}, timeout: 100000}

    })
  }

  var Comment = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'comment'}, {
      getComments: {method: 'GET', params: {route: 'getComments'}, timeout: 100000}
    })
  }

  var VitalSign = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'vitalSign'}, {
      getVitalSigns: {method: 'GET', params: {route: 'vitalSigns'}, timeout: 100000}
    })
  }

  var Account = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'account'}, {
      getAccountInfo: {method: 'GET', params: {route: 'getAccountInfo'}, timeout: 100000},
      modifyCounts: {method: 'POST', params: {route: 'counts'}, timeout: 100000},
      getCounts: {method: 'GET', params: {route: 'counts'}, timeout: 100000}
    })
  }

  var Message = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'message'}, {
      getMessages: {method: 'GET', params: {route: 'messages'}, timeout: 100000}
    })
  }

  var New = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'new'}, {
      getNews: {method: 'GET', params: {route: 'news'}, timeout: 100000},
      insertNews: {method: 'POST', params: {route: 'news'}, timeout: 100000},
      getNewsByReadOrNot: {method: 'GET', skipAuthorization: true, params: {route: 'newsByReadOrNot'}, timeout: 100000}
    })
  }

  var Communication = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'communication'}, {
      conclusion: {method: 'POST', params: {route: 'conclusion'}, timeout: 100000},
      getCommunication: {method: 'GET', params: {route: 'communication'}, timeout: 100000},
      getCounselReport: {method: 'GET', params: {route: 'counselReport'}, timeout: 100000},
      getTeam: {method: 'GET', params: {route: 'team'}, timeout: 100000},
      insertMember: {method: 'POST', params: {route: 'insertMember'}, timeout: 100000},
      newConsultation: {method: 'POST', params: {route: 'consultation'}, timeout: 100000},
      newTeam: {method: 'POST', params: {route: 'team'}, timeout: 100000},
      removeMember: {method: 'POST', params: {route: 'removeMember'}, timeout: 100000},
      updateLastTalkTime: {method: 'POST', params: {route: 'updateLastTalkTime'}, timeout: 100000},
      getConsultation: {method: 'GET', params: {route: 'consultation'}, timeout: 100000}
    })
  }

  var Insurance = function () {
    return $resource(CONFIG.baseUrl2 + ':path/:route', {path: 'insurance'}, {
      getInsMsg: {method: 'GET', params: {route: 'message'}, timeout: 100000},
      updateInsuranceMsg: {method: 'POST', params: {route: 'message'}, timeout: 100000}
    })
  }

  var wechat = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'wechat'}, {
      settingConfig: {method: 'GET', skipAuthorization: true, params: {route: 'settingConfig'}, timeout: 100000},
      getUserInfo: {method: 'GET', skipAuthorization: true, params: {route: 'getUserInfo'}, timeout: 10000},
      download: {method: 'GET', params: {route: 'download'}, timeout: 100000},
      messageTemplate: {method: 'POST', params: {route: 'messageTemplate'}, timeout: 100000},
      createTDCticket: {method: 'POST', params: {route: 'createTDCticket'}, timeout: 100000}
    })
  }

  var jm = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'jm'}, {
      users: {method: 'POST', params: {route: 'users'}, timeout: 100000},
      groups: {method: 'POST', params: {route: 'groups'}, timeout: 100000},
      groupsMembers: {method: 'POST', params: {route: 'groups/members'}, timeout: 100000}
    })
  }

  var Expense = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'expense'}, {
      getDocRecords: {method: 'GET', params: {route: 'docRecords'}, timeout: 100000}
    })
  }

  var Advice = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path: 'advice'}, {
      postAdvice: {method: 'POST', params: {route: 'postAdvice'}, timeout: 100000}
    })
  }

  serve.abort = function ($scope) {
    abort.resolve()
    $interval(function () {
      abort = $q.defer()
      serve.Dict = Dict()
            // serve.Task1 = Task1();
      serve.Task = Task()
      serve.Compliance = Compliance()
      serve.Counsel = Counsel()
      serve.Patient = Patient()
      serve.Doctor = Doctor()
      serve.Nurse = Nurse()
      serve.Health = Health()
      serve.Comment = Comment()
      serve.VitalSign = VitalSign()
      serve.Account = Account()
      serve.Message = Message()
      serve.New = New()
      serve.Communication = Communication()
      serve.User = User()
      serve.Insurance = Insurance()
      serve.wechat = wechat()
      serve.jm = jm()
      serve.Expense = Expense()
      serve.Advice = Advice()
    }, 0, 1)
  }
  serve.Dict = Dict()
    // serve.Task1 = Task1();
  serve.Task = Task()
  serve.Compliance = Compliance()
  serve.Counsel = Counsel()
  serve.Patient = Patient()
  serve.Doctor = Doctor()
  serve.Nurse = Nurse()
  serve.Health = Health()
  serve.Comment = Comment()
  serve.VitalSign = VitalSign()
  serve.Account = Account()
  serve.Message = Message()
  serve.New = New()
  serve.Communication = Communication()
  serve.User = User()
  serve.Insurance = Insurance()
  serve.wechat = wechat()
  serve.jm = jm()
  serve.Expense = Expense()
  serve.Advice = Advice()
  return serve
}])
.factory('Dict', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->{
            //  category:'patient_class'
            // }
  self.getDiseaseType = function (params) {
    var deferred = $q.defer()
    Data.Dict.getDiseaseType(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.getDistrict = function (params) {
    var deferred = $q.defer()
    Data.Dict.getDistrict(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.getHospital = function (params) {
    var deferred = $q.defer()
    Data.Dict.getHospital(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  category:'healthInfoType'
           // }
  self.getHeathLabelInfo = function (params) {
    var deferred = $q.defer()
    Data.Dict.getHeathLabelInfo(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
    //    category:'MessageType'
    // }
  self.typeOne = function (params) {
    var deferred = $q.defer()
    Data.Dict.typeOne(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('Task', ['$q', 'Data', function ($q, Data) {
  var self = this

  self.changeTaskstatus = function (params) {
    var deferred = $q.defer()
    Data.Task.changeTaskstatus(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  userId:'U201704050002',//unique
            //  sortNo:1,
           // }
  self.insertTask = function (params) {
    var deferred = $q.defer()
    Data.Task.insertTask(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  userId:'U201704050002',//unique
            //  sortNo:1,
            //  type:'Measure',
            //  code:'BloodPressure',
            //  startTime:'2017-12-12'
           // }
  self.changeTasktime = function (params) {
    var deferred = $q.defer()
    Data.Task.changeTasktime(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.getUserTask = function (params) {
    var deferred = $q.defer()
    Data.Task.getUserTask(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.updateUserTask = function (params) {
    var deferred = $q.defer()
    Data.Task.updateUserTask(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])
.factory('Compliance', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->{
            // "userId": "U201704050002",
            // "type": "Measure",
            // "code": "Weight",
            // "date": "2017-12-13",
            // "status": 0,
            // "description": ""
           // }
  self.postcompliance = function (params) {
    var deferred = $q.defer()
    Data.Compliance.postcompliance(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  userId:'U201704050002',//date为空时获取指定用户的全部任务执行记录，date不为空时获取指定用户某一天的任务执行记录
            //  date:'2017-12-13'
           // }
  self.getcompliance = function (params) {
    var deferred = $q.defer()
    Data.Compliance.getcompliance(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('Nurse', ['$q', 'Data', function ($q, Data) {
  var self = this

  self.getPatientsList = function (params) {
    var deferred = $q.defer()
    Data.Nurse.getPatientsList(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.updatePatientsList = function (params) {
    var deferred = $q.defer()
    Data.Nurse.updatePatientsList(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('Communication', ['$q', 'Data', 'Storage', function ($q, Data, Storage) {
  var self = this
    // params->0:{
            //      teamId:'teampost2',
            //      name:'id1',
            //      sponsorId:'id'
            //      sponsorName:'DOCname'
            //      description:''
            //  }
  self.newTeam = function (params) {
    var deferred = $q.defer()
    Data.Communication.newTeam(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{counselId:'counsel01'}
  self.getCounselReport = function (params) {
    var deferred = $q.defer()
    Data.Communication.getCounselReport(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params-> messageType=2&id2=teamOrConsultation&limit=1&skip=0
    //         messageType=1&id1=doc&id2=pat&limit=1&skip=0
  self.getCommunication = function (params) {
    var deferred = $q.defer()
    Data.Communication.getCommunication(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{teamId:'team1'}
  self.getTeam = function (params) {
    var deferred = $q.defer()
    Data.Communication.getTeam(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.getConsultation = function (params) {
    var deferred = $q.defer()
    Data.Communication.getConsultation(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
            //      teamId:'teampost2',
            //      membersuserId:'id1',
            //      membersname:'name2'
            //  }
  self.insertMember = function (params) {
    var deferred = $q.defer()
    Data.Communication.insertMember(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
            //      teamId:'teampost2',
            //      membersuserId:'id2'
            //  }
  self.removeMember = function (params) {
    var deferred = $q.defer()
    Data.Communication.removeMember(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // {
    //     teamId,
    //     counselId,
    //     sponsorId,
    //     patientId,
    //     consultationId,
    //     status:'1'-进行中,'0'-已结束
    // }
  self.newConsultation = function (params) {
    var deferred = $q.defer()
    Data.Communication.newConsultation(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // {
    //     "doctorId":"doc01",
    //     "doctorId2":"doc03",
    //     "lastTalkTime":"2017-04-09T10:00:00"
    // }
  self.updateLastTalkTime = function (id2, millis) {
    var params = {
      'doctorId': Storage.get('UID'),
      'doctorId2': id2,
      'lastTalkTime': (new Date(millis)).toISOString().substr(0, 19)
    }
    var deferred = $q.defer()
    Data.Communication.updateLastTalkTime(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.conclusion = function (params) {
    var deferred = $q.defer()
    Data.Communication.conclusion(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])
.factory('User', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->{
        // phoneNo:"18768113669",
        // password:"123456",
        // role:"patient"
        // }
        // 000
  self.register = function (params) {
    var deferred = $q.defer()
    Data.User.register(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
        // phoneNo:"18768113669",
        // password:"123",
        // }
        // 001
  self.changePassword = function (params) {
    var deferred = $q.defer()
    Data.User.changePassword(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{userId:"U201702070041"}
    // 036
  self.getAgree = function (params) {
    var deferred = $q.defer()
    Data.User.getAgree(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{userId:"U201702070041",agreement:"0"}
    // 037
  self.updateAgree = function (params) {
    var deferred = $q.defer()
    Data.User.updateAgree(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{
        // username:"18768113669",
        // password:"123456",
        // role:"patient"
        // }
        // 002
  self.logIn = function (params) {
    var deferred = $q.defer()
    Data.User.logIn(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{userId:"U201704010002"}
    // 003
  self.logOut = function (params) {
    var deferred = $q.defer()
    Data.User.logOut(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{username:"18768113668"}
    // 004
  self.getUserId = function (params) {
    var deferred = $q.defer()
    Data.User.getUserId(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{
        // mobile:"18768113660",
        // smsType:1}
    // 005
  self.sendSMS = function (params) {
    var deferred = $q.defer()
    Data.User.sendSMS(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{
        // mobile:"18868186038",
        // smsType:1
        // smsCode:234523}
    // 006
  self.verifySMS = function (params) {
    var deferred = $q.defer()
    Data.User.verifySMS(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{openId:"U201703310032"} //20170619 后端删除该方法，与getUserID方法合并
    // self.getUserIDbyOpenId = function(params){
    //     var deferred = $q.defer();
    //     Data.User.getUserIDbyOpenId(
    //         params,
    //         function(data, headers){
    //             deferred.resolve(data);
    //         },
    //         function(err){
    //             deferred.reject(err);
    //     });
    //     return deferred.promise;
    // }

    // params->{phoneNo:"",openId:"U201703310032"}
  self.setOpenId = function (params) {
    var deferred = $q.defer()
    Data.User.setOpenId(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{type:"",userId:"U201703310032"}type:(1:doctorwechat,2:patientwechat,3:doctorapp,4:patientapp,5:test)
  self.getMessageOpenId = function (params) {
    var deferred = $q.defer()
    Data.User.getMessageOpenId(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{type:"",openId:"",userId:""}type:(1:doctorwechat,2:patientwechat,3:doctorapp,4:patientapp,5:test)
  self.setMessageOpenId = function (params) {
    var deferred = $q.defer()
    Data.User.setMessageOpenId(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params-> username:'doc01'
  self.One = function (params) {
    var deferred = $q.defer()
    Data.User.One(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            }
        )
    return deferred.promise
  }

  return self
}])

.factory('Health', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->{
            //  userId:'U201704010003',//unique
            //  type:1,
            //  time:'2014/02/22 11:03:37',
            //  url:'c:/wf/img.jpg',
            //  label:'abc',
            //  description:'wf',
            //  comments:''
           // }
  self.createHealth = function (params) {
    var deferred = $q.defer()
    Data.Health.createHealth(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
        // userId:"U201704010003",
        // }
        // 011
  self.getAllHealths = function (params) {
    var deferred = $q.defer()
    Data.Health.getAllHealths(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
        // userId:"U201704010003",
        // insertTime:"2017-04-11T05:43:36.965Z",
        // }
        // 012
  self.getHealthDetail = function (params) {
    var deferred = $q.defer()
    Data.Health.getHealthDetail(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
        // userId:"U201704010003",
        // insertTime:"2017-04-11T05:43:36.965Z",
        // type:3,
        // time:"2014/02/22",
        // url:"c:/wf/img.jpg",
        // description:"修改晕厥入院，在医院住了3天，双侧颈动脉无异常搏动，双侧颈静脉怒张，肝颈静脉回流征阳性，气管居中，甲状腺不肿大，未触及结节无压痛、震颤，上下均为闻及血管杂音。",
        // }
        // 014
  self.modifyHealth = function (params) {
    var deferred = $q.defer()
    Data.Health.modifyHealth(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->{
        // userId:"U201704010003",
        // insertTime:"2017-04-11T05:43:36.965Z",
        // }
        // 015
  self.deleteHealth = function (params) {
    var deferred = $q.defer()
    Data.Health.deleteHealth(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])
.factory('Message', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->0:{
    //    userId:'U201704120001',
    //    type:1//option
    // }
  self.getMessages = function (params) {
    var deferred = $q.defer()
    Data.Message.getMessages(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])
.factory('New', ['$q', 'Data', 'arrTool', function ($q, Data, arrTool) {
  var self = this
  self.getNews = function (params) {
    var deferred = $q.defer()
    Data.New.getNews(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.insertNews = function (params) {
    var deferred = $q.defer()
    Data.New.insertNews(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.getNewsByReadOrNot = function (params) {
    var deferred = $q.defer()
    Data.New.getNewsByReadOrNot(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  function getIndex (arr, val) {
    for (var i in arr) {
      if (arr[i].userId == val || arr[i].sendBy == val) return i
    }
    return -1
  }
  function addLastMsg (type, userId, msg) {
        // item.lastMsg=msg;
    try {
      msg.url = JSON.parse(msg.url)
      if (type != '11' && type != '12' && msg.url.fromID != userId) {
        msg.description = msg.url.fromName + ':' + msg.description
      }
      if (type == '11' || type == '12') msg.readOrNot = msg.readOrNot || (userId == msg.url.fromID ? 1 : 0)
    } catch (e) {}
    return msg
  }
  self.addNews = function (type, userId, arr, idName) {
    return $q(function (resolve, reject) {
      if (!Array.isArray(arr) || arr.length == 0) return resolve(arr)
      var q = {
        userId: userId,
        type: type,
        userRole: 'doctor'
      }
      self.getNews(q)
            .then(function (res) {
              var msgs = res.results
              arr.map(function (item) {
                if (item === null) return item
                var pos = getIndex(msgs, item[idName])
                if (pos != -1) {
                  item.lastMsg = addLastMsg(type, userId, msgs[pos])
                }
                return item
              })
              resolve(arr)
            }, function (err) {
              resolve(arr)
            })
    })
  }
  self.addNestNews = function (type, userId, arr, idName, keyName) {
    return $q(function (resolve, reject) {
      if (!Array.isArray(arr) || arr.length == 0) return resolve(arr)
      var q = {
        userId: userId,
        type: type,
        userRole: 'doctor'
      }
      self.getNews(q)
            .then(function (res) {
              var msgs = res.results
              arr.map(function (item) {
                if (item[keyName] === null) return item
                var pos = getIndex(msgs, item[keyName][idName])
                if (pos != -1) {
                  item.lastMsg = addLastMsg(type, userId, msgs[pos])
                }
                return item
              })
              resolve(arr)
            }, function (err) {
              resolve(arr)
            })
    })
  }
  return self
}])
.factory('Account', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->0:{userId:'p01'}
  self.getAccountInfo = function (params) {
    var deferred = $q.defer()
    Data.Account.getAccountInfo(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.modifyCounts = function (params) {
    var deferred = $q.defer()
    Data.Account.modifyCounts(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.getCounts = function (params) {
    var deferred = $q.defer()
    Data.Account.getCounts(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])
.factory('VitalSign', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->0:{userId:'p01',type:'type1'}
  self.getVitalSigns = function (params) {
    var deferred = $q.defer()
    Data.VitalSign.getVitalSigns(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])
.factory('Comment', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->0:{userId:'doc01'}
  self.getComments = function (params) {
    var deferred = $q.defer()
    Data.Comment.getComments(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])
.factory('Patient', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->0:{userId:'p01'}
  self.getPatientDetail = function (params) {
    var deferred = $q.defer()
    Data.Patient.getPatientDetail(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{userId:'p01'}
  self.getMyDoctors = function (params) {
    var deferred = $q.defer()
    Data.Patient.getMyDoctors(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{workUnit:'浙江省人民医院'}
    //        1:{workUnit:'浙江省人民医院',name:'医生01'}
  self.getDoctorLists = function (params) {
    var deferred = $q.defer()
    Data.Patient.getDoctorLists(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{userId:'p01'}
  self.getCounselRecords = function (params) {
    var deferred = $q.defer()
    Data.Patient.getCounselRecords(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
            //     patientId:'ppost01',
            //     doctorId:'doc01',
            //     diagname:'慢性肾炎',
            //     diagtime:'2017-04-06',
            //     diagprogress:'吃药',
            //     diagcontent:'blabla啥啥啥的'
            // }
  self.insertDiagnosis = function (params) {
    var deferred = $q.defer()
    Data.Patient.insertDiagnosis(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
            //     userId:'ppost01',
            //     name:'患者xx',
            //     birthday:'1987-03-25',
            //     gender:2,
            //     IDNo:123456123456781234,
            //     height:183,
            //     weight:70,
            //     bloodType:2,
            //     class:'class1',
            //     class_info:'info_1',
            //     operationTime:'2017-04-05',
            //     hypertension:1,
            //     photoUrl:'http://photo/ppost01.jpg'
            // }
  self.newPatientDetail = function (params) {
    var deferred = $q.defer()
    Data.Patient.newPatientDetail(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
                // userId:'ppost01',
                // name:'新名字2',
                // birthday:1987-03-03,
                // gender:1,
                // IDNo:123456123456781234,
                // height:183,
                // weight:70,
                // bloodType:2,
                // class:'class1',
                // class_info:'info3',
                // hypertension:1,
                // photoUrl:'http://photo/ppost01.jpg'
            // }
  self.editPatientDetail = function (params) {
    var deferred = $q.defer()
    Data.Patient.editPatientDetail(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])
.factory('Doctor', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->0:{
           //   userId:'docpostTest',//unique
           //   name:'姓名',
           //   birthday:'1956-05-22',
           //   gender:1,
           //   workUnit:'浙江省人民医院',
           //   department:'肾内科',
           //   title:'副主任医师',
           //   major:'慢性肾炎',
           //   description:'经验丰富',
           //   photoUrl:'http://photo/docpost3.jpg',
           //   charge1:150,
           //   charge2:50
           // }
  self.postDocBasic = function (params) {
    var deferred = $q.defer()
    Data.Doctor.postDocBasic(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
       //   userId:'doc01'
       // }
  self.getPatientList = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getPatientList(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
       //   userId:'doc01'
       // }
  self.getRecentDoctorList = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getRecentDoctorList(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
           //   userId:'doc01'
           // }
  self.getDoctorInfo = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getDoctorInfo(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
           //   userId:'doc01'
           // }
  self.getMyGroupList = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getMyGroupList(
            params,
            function (data, headers) {
              deferred.resolve(data.results)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
           //   userId:'doc01'
           // }
  self.getRecentDoctorList = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getRecentDoctorList(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
           //   teamId:'team1',
           //   status:1
           // }
  self.getGroupPatientList = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getGroupPatientList(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.editDoctorDetail = function (params) {
    var deferred = $q.defer()
    Data.Doctor.editDoctorDetail(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
           //   userId:'doc01',
           //   day:0,//0-6->周一，周二...周日
           //   time:0//0->上午 1->下午
           // }
  self.insertSchedule = function (params) {
    var deferred = $q.defer()
    Data.Doctor.insertSchedule(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
           //   userId:'doc01'
           // }
  self.getSchedules = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getSchedules(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
           //   userId:'doc01',
           //   day:0,//0-6->周一，周二...周日
           //   time:0//0->上午 1->下午
           // }
  self.deleteSchedule = function (params) {
    var deferred = $q.defer()
    Data.Doctor.deleteSchedule(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
    //   userId:'doc01'
    // }
  self.getSuspendTime = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getSuspendTime(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
           //   userId:'doc01',
           //   start:new Date(),
           //   end:new Date(),
           // }
  self.insertSuspendTime = function (params) {
    var deferred = $q.defer()
    Data.Doctor.insertSuspendTime(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
           //   userId:'doc01',
           //   start:new Date(),
           //   end:new Date(),
           // }
  self.deleteSuspendTime = function (params) {
    var deferred = $q.defer()
    Data.Doctor.deleteSuspendTime(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->0:{
           //   userId:'doc01',
           // }
  self.getPatientByDate = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getPatientByDate(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->empty
  self.getDocNum = function () {
    var deferred = $q.defer()
    Data.Doctor.getDocNum(
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

    // params->userId:'doc01'
  self.getAliPayAccount = function (params) {
    var deferred = $q.defer()
    Data.Doctor.getAliPayAccount(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{userId:'doc01',aliPayAccount:'abc@def.com'}
  self.editAliPayAccount = function (params) {
    var deferred = $q.defer()
    Data.Doctor.editAliPayAccount(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            }
        )
    return deferred.promise
  }

  return self
}])
.factory('Counsel', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->0:{userId:'doc01',status:1}
    //        1:{userId:'doc01'}
    //        2:{userId:'doc01',type:1}
    //        3:{userId:'doc01',status:1,type:1}
  self.getCounsels = function (params) {
    var deferred = $q.defer()
    Data.Counsel.getCounsel(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
    //              counselId:'counselpost02',
    //              patientId:'p01',
    //              doctorId:'doc01',
    //              sickTime:'3天',
    //              symptom:'腹痛',
    //              symptomPhotoUrl:'http://photo/symptom1',
    //              help:'帮助'
    //          }
  self.questionaire = function (params) {
    var deferred = $q.defer()
    Data.Counsel.questionaire(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.changeCounselStatus = function (params) {
    var deferred = $q.defer()
    Data.Counsel.changeCounselStatus(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.getStatus = function (params) {
    var deferred = $q.defer()
    Data.Counsel.getStatus(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  self.changeStatus = function (params) {
    var deferred = $q.defer()
    Data.Counsel.changeStatus(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('Insurance', ['$q', 'Data', function ($q, Data) {
  var self = this
    // //params->0:{
    //                 doctorId:'doc01',
    //                 patientId:'p01'
    //             }
  self.getInsMsg = function (params) {
    var deferred = $q.defer()
    Data.Insurance.getInsMsg(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->0:{
                    // doctorId:'doc01',
                    // patientId:'p02',
                    // insuranceId:'ins01'
    //          }
  self.updateInsuranceMsg = function (params) {
    var deferred = $q.defer()
    Data.Insurance.updateInsuranceMsg(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])

.factory('arrTool', function () {
  return {
    indexOf: function (arr, key, val, binary) {
      if (binary) {
                // 已排序，二分,用于消息
                // var first=0,last=arr.length,mid=(first+last)/2;
                // while(arr[mid][key]!=val){
                //     if(arr[mid])
                // }
      } else {
        for (var i = 0, len = arr.length; i < len; i++) {
          if (arr[i][key] == val) return i
        }
        return -1
      }
    }
  }
})

.factory('wechat', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->{
            //  url:'patient_class'
           // }
  self.settingConfig = function (params) {
    params.role = 'doctor'
    var deferred = $q.defer()
    Data.wechat.settingConfig(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  code:'3'
            // }
  self.getUserInfo = function (params) {
    params.role = 'doctor'
    var deferred = $q.defer()
    Data.wechat.getUserInfo(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  serverId:
            //  name:
            // }
  self.download = function (params) {
    params.role = 'doctor'
    var deferred = $q.defer()
    Data.wechat.download(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.messageTemplate = function (params) {
    var deferred = $q.defer()
    Data.wechat.messageTemplate(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  self.createTDCticket = function (params) {
    params.role = 'patient'
    var deferred = $q.defer()
    Data.wechat.createTDCticket(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])
.factory('jm', ['$q', 'Data', function ($q, Data) {
  var self = this
    // params->{
            //  url:'patient_class'
           // }
  self.users = function (params) {
    var deferred = $q.defer()
    Data.jm.users(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  code:'3'
            // }
  self.groups = function (params) {
    var deferred = $q.defer()
    Data.jm.groups(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
    // params->{
            //  serverId:
            //  name:
            // }
  self.groupsMembers = function (params) {
    var deferred = $q.defer()
    Data.jm.groupsMembers(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])

.factory('Expense', ['$q', 'Data', function ($q, Data) {
  var self = this

    // params->0:{
                    // doctorId:'U201705050009',
                    // limit:3,
                    // skip:0
    //          }
  self.getDocRecords = function (params) {
    var deferred = $q.defer()
    Data.Expense.getDocRecords(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }

  return self
}])

.factory('Advice', ['$q', 'Data', function ($q, Data) {
  var self = this
  self.postAdvice = function (params) {
    var deferred = $q.defer()
    Data.Advice.postAdvice(
            params,
            function (data, headers) {
              deferred.resolve(data)
            },
            function (err) {
              deferred.reject(err)
            })
    return deferred.promise
  }
  return self
}])
