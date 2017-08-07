// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('kidney', [
  'ionic',
  'ngCordova',
  'zy.controllers',
  'kidney.services',
  'kidney.filters',
  'kidney.directives',
  'monospaced.qrcode',
  'ionic-datepicker',
  'kidney.icon_filter',
  'angular-jwt'
])

.run(['$ionicPlatform', '$state', 'Storage', 'JM', '$ionicHistory', '$rootScope', 'CONFIG', 'Communication', '$location', 'wechat', '$window', 'User', 'Doctor', 'jmapi', '$ionicPopup', '$q', function ($ionicPlatform, $state, Storage, JM, $ionicHistory, $rootScope, CONFIG, Communication, $location, wechat, $window, User, Doctor, jmapi, $ionicPopup, $q) {
  $ionicPlatform.ready(function () {
    socket = io.connect(CONFIG.socketUrl)
    Storage.rm('chatSender')

    var temp = $location.absUrl().split('=')
        // alert(temp)
    if (angular.isDefined(temp[1]) == true) {
      if (angular.isDefined(temp[2]) == true) {
        var code = temp[1].split('&')[0]
        var state = temp[2].split('#')[0]
        var params = state.split('_')
        Storage.set('code', code)
      } else {
        var code = temp[1].split('#')[0]
        Storage.set('code', code)
      }
    }

    var wechatData = ''
    if (code != '' && code != undefined) {
      wechat.getUserInfo({code: code}).then(function (data) {
                // alert(1)
        wechatData = data.results
                // console.log(wechatData)
                // alert(wechatData.openid)
                // alert(wechatData.nickname)
        Storage.set('openid', wechatData.unionid)
        Storage.set('messageopenid', wechatData.openid)
        Storage.set('wechathead', wechatData.headimgurl)
        if (wechatData.unionid && wechatData.openid) {
          User.logIn({username: Storage.get('openid'), password: Storage.get('openid'), role: 'doctor'}).then(function (data) {
            console.log(data)
            if (data.results.mesg == 'login success!') {
                                    // $scope.logStatus = "登录成功！";
              $ionicHistory.clearCache()
              $ionicHistory.clearHistory()
              User.getUserId({username: Storage.get('openid')}).then(function (data) {
                if (angular.isDefined(data.phoneNo) == true) {
                  Storage.set('USERNAME', data.phoneNo)
                }
              }, function (err) {
                console.log(err)
              })
              Storage.set('TOKEN', data.results.token)// token作用目前还不明确
              Storage.set('isSignIn', true)
              Storage.set('UID', data.results.userId)

              jmapi.users(data.results.userId)

              var results = []
              var errs = []

              if (state == 'testqrcode' || state == 'qrcode') {
                $state.go('myqrcode')
              } else if (state == 'testnewsufferer' || state == 'newsufferer') {
                $state.go('tab.patient')
              } else if (params.length > 1 && params[0] == 'doctor') {
                if (params[1] == '13') { $state.go('tab.group-chat', {type: params[2], groupId: params[3], teamId: params[4]}) } else { $state.go('tab.detail', {type: params[2], chatId: params[3], counselId: params[4]}) }
              } else {
                $q.all([
                  User.getAgree({userId: data.results.userId}).then(function (res) {
                    results.push(res)
                  }, function (err) {
                    errs.push(err)
                  }),
                  User.setMessageOpenId({type: 1, userId: Storage.get('UID'), openId: Storage.get('messageopenid')}).then(function (res) {
                                            // results.push(res)
                  }, function (err) {
                    errs.push(err)
                  }),
                  Doctor.getDoctorInfo({userId: Storage.get('UID')}).then(function (res) {
                    results.push(res)
                  }, function (err) {
                    errs.push(err)
                  })
                ]).then(function () {
                  console.log(results)
                  var a, b
                  for (var i in results) {
                    if (results[i].results.agreement != undefined) {
                      a = i
                    } else {
                      b = i
                    }
                  }
                  if (results[a].results.agreement == '0') {
                    if (results[b].results != null) {
                      if (results[b].results.photoUrl == undefined || results[b].results.photoUrl == '') {
                        Doctor.editDoctorDetail({userId: Storage.get('UID'), photoUrl: wechatData.headimgurl}).then(function (r) {
                          $state.go('tab.home')
                        }, function (err) {
                          $state.go('tab.home')
                        })
                      } else {
                        $state.go('tab.home')
                      }
                    } else {
                      $state.go('tab.home')
                    }
                  } else {
                    $state.go('agreement', {last: 'signin'})
                  }
                })
              }
            } else {
              $state.go('signin')
            }
          },
                            function (data) {
                              if (data.results == null && data.status == 0) {
                                $scope.logStatus = '网络错误！'
                                $state.go('signin')
                                return
                              }
                              if (data.status == 404) {
                                $scope.logStatus = '连接服务器失败！'
                                $state.go('signin')
                                return
                              }
                              $state.go('signin')
                            })
                        // }
                    // },function(err)
                    // {
                    //     console.log(err)
                    // })
        } else {
          $state.go('signin')
        }
      }, function (err) {
        console.log(err)
        $state.go('signin')
              // alert(2);
      })
    } else {
      $state.go('signin')
    }

        // 是否登陆
        // var isSignIN = Storage.get("isSignIN");
        // if (isSignIN == 'YES') {
        //     $state.go('tab.home');
        // }

        // 用户ID
    var userid = ''
        // 记录jmessage当前会话
    $rootScope.conversation = {
      type: null,
      id: ''
    }
    if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true)

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true)
    }
    if (window.StatusBar) {
      StatusBar.styleDefault()
    }

            // 显示通知栏消息
            // custom消息内容
            // 患者发送咨询：{
            //     counsel:data.results,
                        // {
                        //     counselId : "CL201704280021"
                        //     diagnosisPhotoUrl : Array(0)
                        //     doctorId : "58eb2ee11e152b523139e723"
                        //     help : ""
                        //     hospital : "折腾"
                        //     messages : Array(0)
                        //     patientId : "58eb86b9a177a0eab3fbff38"
                        //     revisionInfo : Object
                        //     sickTime : "2017-04-20"
                        //     status : 1
                        //     symptom : ""
                        //     symptomPhotoUrl : Array(0)
                        //     time : "2017-04-28T14:36:40.403Z"
                        //     type : 1
                        //     visitDate : "2017-04-28T00:00:00.000Z"
                        //     __v : 0
                        //     _id : "5903537836408c33ae0663be"
                        // }
            //     type:'card',
            //     patientId:patientId,
            //     patientName:patientname,
            //     doctorId:DoctorId,
            //     //转发信息
            //     fromId:
            //     targetId:
            // }
            // 咨询转发医生：{
            //     counsel:data.results,
            //     type:'card',
            //     patientId:patientId,
            //     patientName:patientname,
            //     doctorId:DoctorId,
            //     //转发信息
            //     targetId:DoctorId,
            //     fromId
            // }
            // 咨询转发团队：{
            //     counsel:data.results,
            //     type:'card',
            //     patientId:patientId,
            //     patientName:patientname,
            //     doctorId:DoctorId,
            //     //转发信息
            //     targetId:teamId,
            //     fromId:doctorId,
            //     //consultation info
            //     consultationId:
            // }
            // 名片{
            //     type:'contact',
            //     doctorInfo:{},
            //     //转发信息
            //     fromId:
            //     targetId:
            // }
            // 显示通知栏消息

        // 聊天用，防止消息被keyboard遮挡
    window.addEventListener('native.keyboardshow', function (e) {
      $rootScope.$broadcast('keyboardshow', e.keyboardHeight)
    })
    window.addEventListener('native.keyboardhide', function (e) {
      $rootScope.$broadcast('keyboardhide')
    })
  })
}])

// --------路由, url模式设置----------------
.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js

    // ios 白屏可能问题配置  禁用侧滑后退？
  $ionicConfigProvider.views.swipeBackEnabled(false)
    // android导航栏在顶部解决办法
  $ionicConfigProvider.platform.android.tabs.style('standard')
  $ionicConfigProvider.platform.android.tabs.position('standard')

    // 注册与登录
  $stateProvider
    // 初始加载页
    .state('welcome', {
      cache: false,
      url: '/welcome',
      templateUrl: 'partials/others/welcome.html',
      controller: 'welcomeCtrl'
    })
    // 登陆
    .state('signin', {
      cache: false,
      url: '/signin',
      templateUrl: 'partials/others/signin.html',
      controller: 'SignInCtrl'
    })
    .state('agreement', {
      cache: false,
      url: '/agreeOrNot',
      params: {last: null},
      templateUrl: 'partials/others/agreement.html',
      controller: 'AgreeCtrl'
    })
    .state('phonevalid', {
      url: '/phonevalid',
      cache: false,
      params: {phonevalidType: null},
      templateUrl: 'partials/others/phonevalid.html',
      controller: 'phonevalidCtrl'
    })
    .state('setpassword', {
      cache: false,
      url: '/setpassword',
      templateUrl: 'partials/others/setpassword.html',
      controller: 'setPasswordCtrl'
    })
    .state('userdetail', {
      cache: false,
      url: '/userdetail',
      templateUrl: 'partials/others/userDetail.html',
      controller: 'userdetailCtrl'
    })
    .state('uploadcertificate', {
      cache: false,
      url: '/uploadcertificate',
      params: {last: null},
      templateUrl: 'partials/others/uploadcertificate.html',
      controller: 'uploadcertificateCtrl'
    })
    .state('messages', {
      cache: false,
      url: '/messages',
      templateUrl: 'partials/others/AllMessage.html',
      controller: 'messageCtrl'
    })
    .state('messagesDetail', {
      cache: false,
      url: '/messagesDetail',
      templateUrl: 'partials/others/VaryMessage.html',
      controller: 'VaryMessageCtrl'
    })
    // 我的二维码(独立页面)
    .state('myqrcode', {
      cache: false,
      url: '/myqrcode',
      templateUrl: 'partials/others/myqrcode.html',
      controller: 'QRcodeCtrl'
    })

    // 选项卡
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'partials/tabs.html',
      controller: 'tabCtrl'
    })

    // 主页面
    .state('tab.home', {
        // cache: false,
      url: '/home',
      views: {
        'tab-home': {
          cache: false,
          controller: 'homeCtrl',
          templateUrl: 'partials/home/homepage.html'
        }
      }
    })

    .state('tab.PatientDetail', {
      url: '/PatientDetail/:userId',
      views: {
        'tab-home': {
          cache: false,
          controller: 'PatientDetailCtrl',
          templateUrl: 'partials/home/PatientDetail.html'
        }
      }
    })

  $urlRouterProvider.otherwise('/welcome')
})

// $httpProvider.interceptors提供http request及response的预处理
.config(['$httpProvider', 'jwtOptionsProvider', function ($httpProvider, jwtOptionsProvider) {
    // 下面的getter可以注入各种服务, service, factory, value, constant, provider等, constant, provider可以直接在.config中注入, 但是前3者不行
  jwtOptionsProvider.config({
    whiteListedDomains: ['121.196.221.44', '121.43.107.106', 'testpatient.haihonghospitalmanagement.com', 'testdoctor.haihonghospitalmanagement.com', 'patient.haihonghospitalmanagement.com', 'doctor.haihonghospitalmanagement.com', 'localhost'],
    tokenGetter: ['options', 'jwtHelper', '$http', 'CONFIG', 'Storage', '$state', '$ionicLoading', '$ionicPopup', function (options, jwtHelper, $http, CONFIG, Storage, $state, $ionicLoading, $ionicPopup) {
         // console.log(config);
        // console.log(CONFIG.baseUrl);

        // var token = sessionStorage.getItem('token');
      var token = Storage.get('TOKEN')
        // var refreshToken = sessionStorage.getItem('refreshToken');
      var refreshToken = Storage.get('refreshToken')
      if (!token && !refreshToken) {
        return null
      }

      var isExpired = true
      try {
            // isExpired = jwtHelper.isTokenExpired(token);
        var temp = jwtHelper.decodeToken(token)
        if (temp.exp === 'undefined') {
          isExpired = false
        } else {
              // var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
              // d.setUTCSeconds(temp.expireAfter);
          isExpired = !(temp.exp > new Date().valueOf())// (new Date().valueOf() - 8*3600*1000));
              // console.log(temp)
        }

             // console.log(isExpired);
      } catch (e) {
        console.log(e)
        isExpired = true
      }
        // 这里如果同时http.get两个模板, 会产生两个$http请求, 插入两次jwtInterceptor, 执行两次getrefreshtoken的刷新token操作, 会导致同时查询redis的操作, ×××估计由于数据库锁的关系×××(由于token_manager.js中的exports.refreshToken中直接删除了redis数据库里前一个refreshToken, 导致同时发起的附带有这个refreshToken的getrefreshtoken请求查询返回reply为null, 导致返回"凭证不存在!"错误), 其中一次会查询失败, 导致返回"凭证不存在!"错误, 使程序流程出现异常(但是为什么会出现模板不能加载的情况? 是什么地方阻止了模板的下载?)
      if (options.url.substr(options.url.length - 5) === '.html' || options.url.substr(options.url.length - 3) === '.js' || options.url.substr(options.url.length - 4) === '.css' || options.url.substr(options.url.length - 4) === '.jpg' || options.url.substr(options.url.length - 4) === '.png' || options.url.substr(options.url.length - 4) === '.ico' || options.url.substr(options.url.length - 5) === '.woff') {  // 应该把这个放到最前面, 否则.html模板载入前会要求refreshToken, 如果封装成APP后, 这个就没用了, 因为都在本地, 不需要从服务器上获取, 也就不存在http get请求, 也就不会interceptors
             // console.log(config.url);
        return null
      } else if (isExpired) {    // 需要加上refreshToken条件, 否则会出现网页循环跳转
            // This is a promise of a JWT token
             // console.log(token);
        if (refreshToken && refreshToken.length >= 16) {  // refreshToken字符串长度应该大于16, 小于即为非法
          return $http({
            url: CONFIG.baseUrl + 'token/refresh?refresh_token=' + refreshToken,
                    // This makes it so that this request doesn't send the JWT
            skipAuthorization: true,
            method: 'GET',
            timeout: 5000
          }).then(function (res) { // $http返回的值不同于$resource, 包含config等对象, 其中数据在res.data中
                     // console.log(res);
                    // sessionStorage.setItem('token', res.data.token);
                    // sessionStorage.setItem('refreshToken', res.data.refreshToken);
            Storage.set('TOKEN', res.data.results.token)
            Storage.set('refreshToken', res.data.results.refreshToken)
            return res.data.results.token
          }, function (err) {
            console.log(err)
            if (refreshToken == Storage.get('refreshToken')) {
                      // console.log("凭证不存在!")
                      // console.log(options)
              $ionicPopup.show({
                title: '您离开太久了，请重新登录',
                buttons: [
                  {
                    text: '取消',
                    type: 'button'
                  },
                  {
                    text: '確定',
                    type: 'button-positive',
                    onTap: function (e) {
                      $state.go('signin')
                    }
                  }
                ]
              })
            }
                    // sessionStorage.removeItem('token');
                    // sessionStorage.removeItem('refreshToken');
                    // Storage.rm('token');
                    // Storage.rm('refreshToken');
            return null
          })
        } else {
          Storage.rm('refreshToken')  // 如果是非法refreshToken, 删除之
          return null
        }
      } else {
            // console.log(token);
        return token
      }
    }]
  })

  $httpProvider.interceptors.push('jwtInterceptor')
}])
.controller('tabCtrl', ['$state', '$scope', function ($state, $scope) {
  $scope.goHome = function () {
    setTimeout(function () {
      $state.go('tab.home', {})
    }, 20)
  }
}])
