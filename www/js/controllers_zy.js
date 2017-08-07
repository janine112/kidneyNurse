angular.module('zy.controllers', ['ionic', 'kidney.services'])

/// //////////////////////////zhangying///////////////////////
// 登录
.controller('SignInCtrl', ['User', '$scope', '$timeout', '$state', 'Storage', 'loginFactory', '$ionicHistory', '$location', 'wechat', '$window', '$rootScope', 'Doctor', '$sce', '$ionicPopup', function (User, $scope, $timeout, $state, Storage, loginFactory, $ionicHistory, $location, wechat, $window, $rootScope, Doctor, $sce, $ionicPopup) {
  $scope.barwidth = 'width:0%'
  $scope.navigation_login = $sce.trustAsResourceUrl('http://proxy.haihonghospitalmanagement.com/member.php?mod=logging&action=logout&formhash=xxxxxx')
  if (Storage.get('USERNAME') != null) {
    $scope.logOn = {username: Storage.get('USERNAME'), password: ''}
  } else {
    $scope.logOn = {username: '', password: ''}
  }
  $scope.signIn = function (logOn) {
    $scope.logStatus = ''

    if ((logOn.username != '') && (logOn.password != '')) {
      var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            // 手机正则表达式验证
      if (!phoneReg.test(logOn.username)) {
        $scope.logStatus = '手机号验证失败！'
      } else {
        var logPromise = User.logIn({username: logOn.username, password: logOn.password, role: 'doctor'})
        logPromise.then(function (data) {
          if (data.results == 1) {
            if (data.mesg == "User doesn't Exist!") {
              $scope.logStatus = '账号不存在！'
            } else if (data.mesg == "User password isn't correct!") {
              $scope.logStatus = '账号或密码错误！'
            } else if (data.mesg == 'No authority!') {
              $scope.logStatus = '没有医生权限，请注册医生或进入肾事管家进行操作！'
            } else {
              $scope.logStatus = '账号密码错误！'
            }
          } else if (data.results.mesg == 'login success!') {
            $scope.logStatus = '登录成功！'
            $ionicHistory.clearCache()
            $ionicHistory.clearHistory()
            Storage.set('USERNAME', $scope.logOn.username)
            Storage.set('TOKEN', data.results.token)// token作用目前还不明确
            Storage.set('isSignIn', true)
            Storage.set('UID', data.results.userId)

            Doctor.getDoctorInfo({userId: data.results.userId})
                        .then(function (response) {
                          thisDoctor = response.results
                        }, function (err) {
                          thisDoctor = null
                        })
            User.setMessageOpenId({type: 1, userId: Storage.get('UID'), openId: Storage.get('messageopenid')}).then(function (res) {
            }, function (err) {
            })
            User.getAgree({userId: data.results.userId}).then(function (res) {
              if (res.results.agreement == '0') {
                $timeout(function () { $state.go('tab.home') }, 500)
              } else {
                $timeout(function () { $state.go('agreement', {last: 'signin'}) }, 500)
              }
            }, function (err) {
              console.log(err)
            })
          }
        },
                function (data) {
                  if (data.results == null && data.status == 0) {
                    $scope.logStatus = '网络错误！'
                    return
                  }
                  if (data.status == 404) {
                    $scope.logStatus = '连接服务器失败！'
                  }
                })
      }
    } else {
      $scope.logStatus = '请输入完整信息！'
    }
  }

  $scope.toReset = function () {
    Storage.set('validMode', 1)// 修改密码
    $state.go('phonevalid')
  }

  $scope.bindwechat = function () {
    $ionicPopup.show({
      title: '由于系统更新，如您已拥有手机账号，请重新进行验证并绑定微信账号。如果您是首次使用，请点击取消后进行注册！',
      buttons: [
        {
          text: '取消',
          type: 'button',
          onTap: function (e) {
            $state.go('signin')
          }
        },
        {
          text: '確定',
          type: 'button-positive',
          onTap: function (e) {
            Storage.set('validMode', 0)
            $state.go('phonevalid', {phonevalidType: 'wechat'})
          }
        }
      ]
    })
  }
}])

// 手机号码验证
.controller('phonevalidCtrl', ['$scope', '$state', '$interval', '$stateParams', 'Storage', 'User', '$timeout', 'Doctor', '$ionicPopup', function ($scope, $state, $interval, $stateParams, Storage, User, $timeout, Doctor, $ionicPopup) {
  $scope.barwidth = 'width:0%'
  $scope.Verify = {Phone: '', Code: ''}
  $scope.veritext = '获取验证码'
  $scope.isable = false
  var tempuserId = ''
  var validMode = Storage.get('validMode')// 0->set;1->reset
  var unablebutton = function () {
     // 验证码BUTTON效果
    $scope.isable = true
    console.log($scope.isable)
    $scope.veritext = '60S再次发送'
    var time = 59
    var timer
    timer = $interval(function () {
      if (time == 0) {
        $interval.cancel(timer)
        timer = undefined
        $scope.veritext = '获取验证码'
        $scope.isable = false
      } else {
        $scope.veritext = time + 'S再次发送'
        time--
      }
    }, 1000)
  }
  var isregisted = false
    // 点击获取验证码
  $scope.getcode = function (Verify) {
    $scope.logStatus = ''

    if (Verify.Phone == '') {
      $scope.logStatus = '手机号码不能为空！'
      return
    }
    var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        // 手机正则表达式验证
  }

    // 判断验证码和手机号是否正确
  $scope.gotoReset = function (Verify) {
    $scope.logStatus = ''
    if (Verify.Phone != '' && Verify.Code != '') {
      var tempVerify = 123
            // 结果分为三种：(手机号验证失败)1验证成功；2验证码错误；3连接超时，验证失败
      var phoneReg = /^(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            // 手机正则表达式验证
      if (phoneReg.test(Verify.Phone)) {
        User.verifySMS({
          mobile: Verify.Phone,
          smsType: 2,
          smsCode: Verify.Code
        }).then(function (succ) {
          console.log(succ)
          if (succ.results == 0) { // 验证成功
            $scope.logStatus = '验证成功！'
            Storage.set('phoneNumber', Verify.Phone)

            if (isregisted) {
              if (!(Storage.get('openid'))) {
                $ionicPopup.show({
                  title: '退出账号时系统记录被清除，请返回公众号重新进入工作台',
                  buttons: [
                    {
                      text: '確定',
                      type: 'button-positive'
                    }
                  ]
                })
              } else {
                User.setOpenId({phoneNo: Verify.Phone, openId: Storage.get('openid')}).then(function (data) {
                  if (data.results == 'success!') {
                    User.setMessageOpenId({type: 1, userId: tempuserId, openId: Storage.get('messageopenid')}).then(function (res) {
                      console.log('setopenid')
                    }, function () {
                      console.log('连接超时！')
                    })
                    $ionicPopup.show({
                      title: '微信账号绑定手机账号成功，是否重置密码？',
                      buttons: [
                        {
                          text: '取消',
                          type: 'button',
                          onTap: function (e) {
                            $state.go('signin')
                          }
                        },
                        {
                          text: '確定',
                          type: 'button-positive',
                          onTap: function (e) {
                            Storage.set('validMode', 1)
                            $state.go('setpassword')
                          }
                        }
                      ]
                    })
                  }
                }, function () {
                  $scope.logStatus = '连接超时！'
                })
              }
            } else if (validMode == 0) {
              $state.go('agreement', {last: 'register'})
            } else {
              $state.go('setpassword')
            }
          } else { // 验证码错误
            $scope.logStatus = '请输入正确的验证码！'
          }
        },
                function (err) {
                  console.log(err)
                  $scope.logStatus = '网络错误！'
                })
      } else { $scope.logStatus = '手机号验证失败！' }
    } else { $scope.logStatus = '请输入完整信息！' }
  }
}])

// 签署协议（0为签署）
.controller('AgreeCtrl', ['User', '$stateParams', '$scope', '$timeout', '$state', 'Storage', '$ionicHistory', '$http', 'Data', function (User, $stateParams, $scope, $timeout, $state, Storage, $ionicHistory, $http, Data) {
  $scope.YesIdo = function () {
    console.log('yesido')
    if ($stateParams.last == 'signin') {
      User.updateAgree({userId: Storage.get('UID'), agreement: '0'}).then(function (data) {
        if (data.results != null) {
          $timeout(function () { $state.go('tab.home') }, 500)
        } else {
          console.log('用户不存在!')
        }
      }, function (err) {
        console.log(err)
      })
    } else if ($stateParams.last == 'register') {
      $timeout(function () { $state.go('setpassword', 0) }, 500)
    }
  }
}])

// 设置密码
.controller('setPasswordCtrl', ['$scope', '$state', '$rootScope', '$timeout', 'Storage', 'User', function ($scope, $state, $rootScope, $timeout, Storage, User) {
  $scope.barwidth = 'width:0%'
  var validMode = Storage.get('validMode')// 0->set;1->reset
  var phoneNumber = Storage.get('RegisterNO')
  $scope.headerText = '设置密码'
  $scope.buttonText = ''
  $scope.logStatus = ''

  if (validMode == 0) { $scope.buttonText = '下一步' } else { $scope.buttonText = '完成' }
  $scope.setPassword = function (password) {
    if (password.newPass != '' && password.confirm != '') {
      if (password.newPass == password.confirm) {
        if (password.newPass.length < 6)// 此处要验证密码格式，//先简单的
                {
          $scope.logStatus = '密码太短了！'
        } else {
          if (validMode == 0) {
            Storage.set('password', password.newPass)
            $state.go('userdetail')
          } else {
            User.changePassword({
              phoneNo: phoneNumber,
              password: password.newPass
            })
                        .then(function (succ) {
                          console.log(succ)
                          $state.go('signin')
                        }, function (err) {
                          console.log(err)
                        })
          }
        }
      } else {
        $scope.logStatus = '两次输入的密码不一致'
      }
    } else {
      $scope.logStatus = '输入不正确!'
    }
  }
}])

.controller('homeCtrl', ['$scope', '$state', 'Storage', '$ionicHistory', 'Patient', 'Nurse', function ($scope, $state, Storage, $ionicHistory, Patient, Nurse) {
 // 获得患者列表,调取列表之前先Post
  $scope.patients = ''
  $scope.myPatient = function () {
    Nurse.updatePatientsList({token: Storage.get('TOKEN')}).then(
      function (result) {
        console.log(result)
      }, function (err) {
      console.log(err)
    })

    Nurse.getPatientsList({token: Storage.get('TOKEN')}).then(
        function (response) {
          $scope.patients = response.data
          if (response.data == []) {
            $scope.hasPatients = false
          } else {
            $scope.hasPatients = true
            console.log($scope.patients)
          }
        }, function (err) {
      console.log(err)
    })
  }
  $scope.myPatient()

  $scope.getPatientInfo = function (id) {
    $state.go('tab.PatientDetail', {userId: id})
  }
}])

.controller('PatientDetailCtrl', ['$scope', '$state', 'Storage', '$ionicHistory', '$ionicLoading', 'CONFIG', 'Patient', 'Insurance', 'New', '$stateParams', function ($scope, $state, Storage, $ionicHistory, $ionicLoading, CONFIG, Patient, Insurance, New, $stateParams) {
  $scope.GoBack = function () {
    $ionicHistory.goBack()
  }
  var userId = $stateParams.userId
  $scope.patient = ''
  Patient.getPatientDetail({userId: userId}).then(
    function (data) {
      $scope.patient = data.results
      console.log($scope.patient)
    },
    function (err) {
      console.log(err)
    }
  )

  $scope.SendInsMsg = function () {
    $ionicLoading.show({
      template: '推送成功',
      duration: 1000
    })

    Insurance.getInsMsg({
      doctorId: Storage.get('UID'),
      patientId: userId
    }).then(function (data) {
      console.log(data)
    }, function (err) {
      console.log(err)
    })

    Insurance.updateInsuranceMsg({
      doctorId: Storage.get('UID'),
      patientId: userId,
      insuranceId: 'ins01',
      description: '护士给您发送了一条保险消息'
    }).then(function (data) {
      console.log(data)
      Storage.set('MessId', data.newResults.message.messageId)

      New.insertNews({
        sendBy: Storage.get('UID'),
        userId: userId,
        type: 5,
        readOrNot: '0',
        description: '护士给您发送了一条保险消息',
        messageId: Storage.get('MessId')
      }).then(function (data) {
        console.log(data)
      }, function (err) {
        console.log(err)
      })
    }, function (err) {
      console.log(err)
    })
  }
}])
