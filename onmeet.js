var server = "https://onnetsystems.co.kr:9090";

var sfutest = null;
var textroom = null;
var screentest = null;
var recordplay = null;

//----- For VideoRoom
var roomId = null;
var roomTitle = "Conf room";
var roomOwner = false;
var userId = null;
var displayName = null;
var feedId = null;
var mystream = null;
var mypvtid = null;
var feeds = [];
var bitrateTimer = [];
var subscriber_mode = false;
var max_member = 30;

//----- For VideoCall
var videocall = null;
var audioenabled = false;
var videoenabled = false;
var ringingSound = new Audio('test_snd.mp3');

//----- For TextRoom
var participants = {}
var transactions = {}

//----- For ScreenSharing
var capture = null;
var role = null;
var room = null;
var source = null;
var spinner = null;
var sharingOn = false;
var isFull = false;

//----- For Recording
var bandwidth = 1024 * 1024;
var recording = false;
var playing = false;
var recordingId = null;
var acodec = null;
var vcodec = null;
var vprofile = null;
var recordData = null;

var noop = function() {};

var connected = false;
var retries = 0;

var calleeId = null;
var calleeName = null;

var iceServers = [{urls: "stun:stun.l.google.com:19302"}];
// var iceServers = [{urls: "stun:112.221.226.101:3478"}];
var iceTransportPolicy = undefined;
var bundlePolicy = undefined;

var channels = {};

var defaultResoltion = "stdres-16:9";

// Check if this browser supports Unified Plan and transceivers
// Based on https://codepen.io/anon/pen/ZqLwWV?editors=0010
var unifiedPlan = false;
if(adapter.browserDetails.browser === 'firefox' && adapter.browserDetails.version >= 59) {
    // Firefox definitely does, starting from version 59
    unifiedPlan = true;
} else if(adapter.browserDetails.browser === 'chrome' && adapter.browserDetails.version >= 72) {
    // Chrome does, but it's only usable from version 72 on
    unifiedPlan = true;
} else if(!window.RTCRtpTransceiver || !('currentDirection' in RTCRtpTransceiver.prototype)) {
    // Safari supports addTransceiver() but not Unified Plan when
    // currentDirection is not defined (see codepen above).
    unifiedPlan = false;
} else {
    // Check if addTransceiver() throws an exception
    var tempPc = new RTCPeerConnection();
    try {
        tempPc.addTransceiver('audio');
        unifiedPlan = true;
    } catch (e) {}
    tempPc.close();
}

//----- For Web Audio API
var audioPitchMode = null;
var pitchChangeEffect = null;
var pitchVal = 0.0;

//----- For Video filter
var videoFilterMode = null;
var videoFilterLevel = -1;

$(document).ready(function() {
    $(window).resize(doResize);
    doResize();
    
    // 토큰이 없으면 로그인 페이지, 있으면 대시보드
    var check = getCookie()
    $('#user_logout').click(userLogout);
    if(check === "") {
        //console.log("##### is Token?(1)", check);
        // Login
        $('#user_login').click(auth);
    } else {
        // 
        showDashboard();
        //console.log("##### is Token?(2)", check);
    } 
});

function doResize() {
    /* 윈도우창 크기 조절시 */ 
    console.log("doResize");

    resizeMultiVideo();
    resizeChatArea();
    resizeMemberListArea();
    
}

function resizeMultiVideo() {
    /* console */
    console.log("resizeMultiVideo");

    //--- 16:9 | 4:3
    var widthRatio = 16;
    var heightRatio = 9;
    var topMargin = 20;
    var btmHeight = 50;
    var winWidth = window.innerWidth - window.innerWidth/10;
    var realWinHeight = window.innerHeight - (topMargin + btmHeight);
    var winHeight = realWinHeight - realWinHeight/10;
    var width;
    var height;
    if(calleeId !== null) {
        if(winWidth > 1280) {
            if(winHeight > 720) {
                width = 1280;
                height = 720;
            } else {
                width = (winHeight/heightRatio)*widthRatio;
                height = winHeight;
            }
        } else {
            var tmpHeight = (winWidth/widthRatio)*heightRatio;
            if(tmpHeight > winHeight) {
                width = (winHeight/heightRatio)*widthRatio;
                height = winHeight;
            } else {
                width = winWidth;
                height = tmpHeight;
            }
        }
        var miniWidth = winWidth/5;
        var miniHeight = (miniWidth/widthRatio)*heightRatio;
        $(".caller-video").css("width", miniWidth + 20 + "px");
        $(".caller-video").css("height", miniHeight + 20 + "px");
        $(".caller-video-bg").css("width", miniWidth + "px");
        $(".caller-video-bg").css("height", miniHeight + "px");

        $("#video_call").css("height", realWinHeight + "px");
        $("#video_call").css("margin-top", topMargin + "px");
        return;
    }
    if(!sharingOn) {
        var userNum = 1 + getUserCount();
        if(userNum === 1) {
            if(winWidth > 1280) {
                if(winHeight > 720) {
                    width = 1280;
                    height = 720;
                } else {
                    width = (winHeight/heightRatio)*widthRatio;
                    height = winHeight;
                }
            } else {
                var tmpHeight = (winWidth/widthRatio)*heightRatio;
                if(tmpHeight > winHeight) {
                    width = (winHeight/heightRatio)*widthRatio;
                    height = winHeight;
                } else {
                    width = winWidth;
                    height = tmpHeight;
                }
            }
        } else if(userNum === 2) {
            var xCnt = 2;
            var yCnt = 1;
            width = winWidth / xCnt;
            height = (width/widthRatio)*heightRatio;
            if((height * yCnt) > winHeight) {
                height = winHeight / yCnt;
                width = (height/heightRatio)*widthRatio;
            }
        } else if(userNum <= 4) {
            var xCnt = 2;
            var yCnt = 2;
            width = winWidth / xCnt;
            height = (width/widthRatio)*heightRatio;
            if((height * yCnt) > winHeight) {
                height = winHeight / yCnt;
                width = (height/heightRatio)*widthRatio;
            }
        } else if(userNum <= 6) {
            var xCnt = 3;
            var yCnt = 2;
            width = winWidth / xCnt;
            height = (width/widthRatio)*heightRatio;
            if((height * yCnt) > winHeight) {
                height = winHeight / yCnt;
                width = (height/heightRatio)*widthRatio;
            }
        // } else if(userNum <= 16) {
        //     var xCnt = 4;
        //     var yCnt = Math.round(userNum/xCnt);
        //     width = winWidth / 4;
        //     height = (width/widthRatio)*heightRatio;
        } else {
            var xCnt = 4;
            var yCnt = Math.round(userNum/xCnt);
            width = winWidth / 4;
            height = (width/widthRatio)*heightRatio;
        }
        $("#members").css("height", realWinHeight + "px");
        $("#members").css("margin-top", topMargin + "px");
    } else {
        var sideWidth = window.innerWidth / 4;
        width = sideWidth - sideWidth/20;
        height = (width/widthRatio)*heightRatio;
        width = parseInt(width);
        height = parseInt(height);
        $("#members").css("height", (window.innerHeight - 50) + "px");
    }
    width = parseInt(width);
    height = parseInt(height);
    $(".user-video").css("width", width + 20 + "px");
    $(".user-video").css("height", height + 20 + "px");
    $(".video-bg").css("width", width + "px");
    $(".video-bg").css("height", height + "px");
    $("#members").css("display", "flex");
}

function getUserCount() {
    /* console */
    console.log("getUserCount");

    var userCnt = 0;
    for(var i=1; i<max_member; i++) {
        if(feeds[i]) {
            userCnt += 1;
        }
    }
    return userCnt;
}


function resizeChatArea() {
    /* console */
    console.log("resizeChatArea");

    $('#chatroom').css('height', ($(window).height()-200)+"px");
}

function resizeMemberListArea() {
    /* console */
    console.log("resizeMemberListArea");

    $('#member_list').css('height', ($(window).height()-150)+"px");
}

function _createChannelHandler(path, body, callbacks) {
    console.log("_createChannelHandler");

    // Init Channel
    httpAPICall(path, {
        verb: 'POST',
        body: body,
        success: function(json) {
            console.debug(json);

            if(!json["data"]["cid"]) {
                if(json["data"]["reason"]) {
                    callbacks.error(json["data"]["reason"]);
                } else {
                    callbacks.error("cid not exist...");
                }
                return;
            }
            var channelId = json["data"]["cid"];
            console.info("##### ChannelID:", channelId);

            var handler =
                {
                    // session : that,
                    id : channelId,
                    detached : false,
                    webrtcStuff : {
                        started : false,
                        myStream : null,
                        streamExternal : false,
                        remoteStream : null,
                        mySdp : null,
                        mediaConstraints : null,
                        pc : null,
                        dataChannel : {},
                        dtmfSender : null,
                        trickle : true,
                        iceDone : false,
                        volume : {
                            value : null,
                            timer : null
                        },
                        bitrate : {
                            value : null,
                            bsnow : null,
                            bsbefore : null,
                            tsnow : null,
                            tsbefore : null,
                            timer : null
                        }
                    },
                    getId : function() { return channelId; },
                    getVolume : function() { return getVolume(channelId, true); },
                    getRemoteVolume : function() { return getVolume(channelId, true); },
                    getLocalVolume : function() { return getVolume(channelId, false); },
                    isAudioMuted : function() { return _isMuted(channelId, false); },
                    muteAudio : function() { return _mute(channelId, false, true); },
                    unmuteAudio : function() { return _mute(channelId, false, false); },
                    isVideoMuted : function() { return _isMuted(channelId, true); },
                    muteVideo : function() { return _mute(channelId, true, true); },
                    unmuteVideo : function() { return _mute(channelId, true, false); },
                    getBitrate : function() { return getBitrate(channelId); },
                    send : function(callbacks) { sendMessage(channelId, callbacks); },
                    data : function(callbacks) { _sendData(channelId, callbacks); },
                    dtmf : function(callbacks) { sendDtmf(channelId, callbacks); },
                    consentDialog : callbacks.consentDialog,
                    iceState : callbacks.iceState,
                    mediaState : callbacks.mediaState,
                    webrtcState : callbacks.webrtcState,
                    slowLink : callbacks.slowLink,
                    onmessage : callbacks.onmessage,
                    createOffer : function(callbacks) { _prepareWebrtc(channelId, true, callbacks); },
                    createAnswer : function(callbacks) { _prepareWebrtc(channelId, false, callbacks); },
                    handleRemoteJsep : function(callbacks) { _prepareWebrtcPeer(channelId, callbacks); },
                    onlocalstream : callbacks.onlocalstream,
                    onremotestream : callbacks.onremotestream,
                    ondata : callbacks.ondata,
                    ondataopen : callbacks.ondataopen,
                    oncleanup : callbacks.oncleanup,
                    ondetached : callbacks.ondetached,
                    hangup : function() { _cleanupWebrtc(channelId); },
                    detach : function(callbacks) { _destroyHandle(channelId, callbacks); }
                }
            channels[channelId] = handler;
            callbacks.success(handler);
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
}


function _createRecordHandler(callbacks) {
    _createRecordAndDataHandler(callbacks, 848884888488);
    console.log("_createRecordHandler")
}

function _createDataHandler(callbacks) {
    _createRecordAndDataHandler(callbacks, 848884888489);
    console.log("_createDataHandler")
}

function _createRecordAndDataHandler(callbacks, channelId) {
    console.log("_createRecordAndDataHandler");

    var handler =
        {
            // session : that,
            id : channelId,
            detached : false,
            webrtcStuff : {
                started : false,
                myStream : null,
                streamExternal : false,
                remoteStream : null,
                mySdp : null,
                mediaConstraints : null,
                pc : null,
                dataChannel : {},
                dtmfSender : null,
                trickle : true,
                iceDone : false,
                volume : {
                    value : null,
                    timer : null
                },
                bitrate : {
                    value : null,
                    bsnow : null,
                    bsbefore : null,
                    tsnow : null,
                    tsbefore : null,
                    timer : null
                }
            },
            getId : function() { return channelId; },
            getVolume : function() { return getVolume(channelId, true); },
            getRemoteVolume : function() { return getVolume(channelId, true); },
            getLocalVolume : function() { return getVolume(channelId, false); },
            isAudioMuted : function() { return _isMuted(channelId, false); },
            muteAudio : function() { return _mute(channelId, false, true); },
            unmuteAudio : function() { return _mute(channelId, false, false); },
            isVideoMuted : function() { return _isMuted(channelId, true); },
            muteVideo : function() { return _mute(channelId, true, true); },
            unmuteVideo : function() { return _mute(channelId, true, false); },
            getBitrate : function() { return getBitrate(channelId); },
            send : function(callbacks) { sendMessage(channelId, callbacks); },
            data : function(callbacks) { _sendData(channelId, callbacks); },
            dtmf : function(callbacks) { sendDtmf(channelId, callbacks); },
            consentDialog : callbacks.consentDialog,
            iceState : callbacks.iceState,
            mediaState : callbacks.mediaState,
            webrtcState : callbacks.webrtcState,
            slowLink : callbacks.slowLink,
            onmessage : callbacks.onmessage,
            createOffer : function(callbacks) { _prepareWebrtc(channelId, true, callbacks); },
            createAnswer : function(callbacks) { _prepareWebrtc(channelId, false, callbacks); },
            handleRemoteJsep : function(callbacks) { _prepareWebrtcPeer(channelId, callbacks); },
            onlocalstream : callbacks.onlocalstream,
            onremotestream : callbacks.onremotestream,
            ondata : callbacks.ondata,
            ondataopen : callbacks.ondataopen,
            oncleanup : callbacks.oncleanup,
            ondetached : callbacks.ondetached,
            hangup : function() { _cleanupWebrtc(channelId); },
            detach : function(callbacks) { _destroyHandle(channelId, callbacks); }
        }
    channels[channelId] = handler;
    callbacks.success(handler);
}


function getVolume(handleId, remote) {
    console.log("getVolume")
}



//--- document.cookie = "Name=Value(값);Expires=날짜;Domain=도메인;Path=경로;Secure";
function getCookie() {
    /* console */
    console.log("getCookie");

    var cookies = document.cookie.split(";");
    var result = "";
    //console.log("####### Cookies:", cookies);
    for(var i in cookies) {
        if(cookies[i].search("onsvc") != -1) {
            result = cookies[i].replace("onsvc=", "");
            break;
        }
    }
    return result !== null ? result : "";
}

function removeCookie() {
    console.log("removeCookie");
    // window.addEventListener('beforeunload', (event) => {});
    // window.removeEventListener('beforeunload', {});
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var cookie = "";
    cookie += "onsvc=" + token;
    cookie += ";expires=" + date.toUTCString();;
    document.cookie = cookie;
    connected = false;

}


function userLogout() {
    console.log("userLogout");
    removeCookie();
    doSessionDestory();
}


function pageReload() {
    console.log("pageReload");
    removeCookie();
    window.location.reload();
}

function httpAPICall(path, options) {

    var url = server + path;
    var fetchOptions = {
        method: options.verb,
        headers: {
            'Accept': 'application/json, text/plain, */*'
        },
        cache: 'no-cache'
    };
    if(options.verb === "POST") {
        fetchOptions.headers['Content-Type'] = 'application/json';
    }
    if(token !== null) {
        fetchOptions.headers['Authorization'] = 'Bearer ' + token;
    }
    if(options.withCredentials !== undefined) {
        fetchOptions.credentials = options.withCredentials === true ? 'include' : (options.withCredentials ? options.withCredentials : 'omit');
    }
    if(options.body) {
        fetchOptions.body = JSON.stringify(options.body);
    }

    if(path !== "/onsvc/check") {
        //console.log("####### Path: " + url);
        //console.log("####### Body: " + JSON.stringify(options.body));
    }
    
    var fetching = fetch(url, fetchOptions).catch(function(error) {
        token = null;
        userId = null;
        //console.log(error);
        //FIXME: 서버가 갑자기 종료된 경우의 대응에 대해 아래 내용 수정 요함..
        bootbox.alert({
            message: "서버 연결 오류. 관리자에게 문의하세요.",
            callback: function() {
                pageReload();
            }
        });
        return Promise.reject({message: 'Probably a network error, is the server down?', error: error});
    });

    /*
     * fetch() does not natively support timeouts.
     * Work around this by starting a timeout manually, and racing it agains the fetch() to see which thing resolves first.
     */
    
    if(options.timeout) {
        var timeout = new Promise(function(resolve, reject) {
            var timerId = setTimeout(function() {
                clearTimeout(timerId);
                return reject({message: 'Request timed out', timeout: options.timeout});
            }, options.timeout);
        });
        fetching = Promise.race([fetching, timeout]);
    }

    fetching.then(function(response) {
        if(response.ok) {
            if(typeof(options.success) === typeof(noop)) {
                return response.json().then(function(parsed) {
                    try {
                        options.success(parsed);
                    } catch(error) {
                        console.error('Unhandled httpAPICall success callback error', error);
                        calleeId = null;
                        calleeName = null;
                    }
                }, function(error) {
                    return Promise.reject({message: 'Failed to parse response body', error: error, response: response});
                });
            }
        }
        else {
            return Promise.reject({message: 'API call failed', response: response});
        }
    }).catch(function(error) {
        if(typeof(options.error) === typeof(noop)) {
            options.error(error.message || '<< internal error >>', error);
        }
    });
    return fetching;
}


var token = null;
var superAdmin = false;
function auth() {

    /* submit button*/
    console.log("auth");

    var data = { id: $('#login_id').val(), password: $('#login_pw').val() };
    var request = { type: 'login', data };
    //console.log("### Auth body:", request);
    httpAPICall("/onsvc/login", {
        verb: 'POST',
        body: request,
        success: function(json) {
            connected = true;
            console.debug(JSON.stringify(json));
            var alertMessage;
            if(json["result"] === "failure" || json["result"] === "error") {
                var reason = json["data"]["reason"];
                var errorCode = json["data"]["error_code"];
                if(errorCode === 4101) {
                    alertMessage = "로그인 정보가 잘못되었습니다. ID 혹은 Password를 다시 확인해주세요.";
                } else if(errorCode === 4102) {
                    alertMessage = "승인되지 않은 계정입니다. 관리자에게 문의해주세요.";
                } else if(errorCode === 4103) {
                    alertMessage = "이미 로그인 되어있는 계정입니다.";
                } else if(errorCode === 4104) {
                    alertMessage = "일시적인 오류가 발생했습니다. 다시 시도해주세요.";
                } else {
                    alertMessage = "[ERROR] Unknown reason: " + reason + "(" + errorCode + ")";
                }
                bootbox.alert({
                    message: alertMessage,
                    callback: function() {
                        window.location.reload();
                    }
                });
            } else {
                if(json["data"]) {
                    var loginData = json["data"];
                    token = loginData["token"];
                    userId = loginData["id"];
                    displayName = loginData["name"];
                    superAdmin = loginData["admin"];
                    longPolling();
                    setCookie(token);
                    showDashboard();
                }
            }
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
    
}


function longPolling() {
    /* 로그인 실패시 longPolling*/
    console.log("longPolling");
    if(!connected) {
        return;
    }
    if(token === null) {
        pageReload();
        return;
    }
    console.debug('Long poll...' + Date());
    httpAPICall("/onsvc/check", {
        verb: 'GET',
        success: _handleEvent,
        timeout: 60000,
        error: function(textStatus, errorThrown) {
            if(errorThrown.error.message === "Failed to fetch") {
                console.warn("[polling] Failed to fetch");
                return;
            }
            console.error(textStatus + ":", errorThrown);
            retries++;
            if(retries > 3) {
                // Did we just lose the server? :-(
                connected = false;
                console.error("Lost connection to the server (is it down?)");
                return;
            }
            longPolling();
        }
    });
}


// Private event handler: this will trigger plugin callbacks, if set
function _handleEvent(json, skipTimeout) {
    console.log("_handleEvent");
    //console.log("Receive Long polling response=", JSON.stringify(json));
    if(skipTimeout !== true)
        longPolling();

    var result = json["result"];
    if(result === "event") {
        // console.info("Receive event.");
        var eventList = json["data"]["event_data_list"];
        for(var i in eventList) {
            var cid = eventList[i]["cid"];
            var eventItem = eventList[i]["event"]; // common | videocall | videoconf | recording | control
            var details = eventList[i]["details"];
            var cHandler = channels[cid];
            var eventType = details["event_type"];

            //--- Event: common
            if(eventItem === "common") {
                //--- EventType: keepalive
                if(eventType === "keepalive") {
                    console.info("Receive keepalive.");
                    continue;
                }
                //--- EventType: trickle
                else if(eventType === "trickle") {
                    console.info("*** trickle *** candidate:", JSON.stringify(details));
                    var candidate = details["candidate"];
                    if(!cHandler) {
                        console.error("channel handler not exist..");
                        continue;
                    }
                    var config = cHandler.webrtcStuff;
                    if(config.pc && config.remoteSdp) {
                        // Add candidate right now
                        console.debug("Adding remote candidate:", candidate);
                        if(!candidate || candidate.completed === true) {
                            // end-of-candidates
                            config.pc.addIceCandidate(endOfCandidates);
                        } else {
                            // New candidate
                            config.pc.addIceCandidate(candidate);
                        }
                    } else {
                        // We didn't do setRemoteDescription (trickle got here before the offer?)
                        console.debug("We didn't do setRemoteDescription (trickle got here before the offer?), caching candidate");
                        if(!config.candidates)
                            config.candidates = [];
                        config.candidates.push(candidate);
                        console.debug(config.candidates);
                    }
                    continue;
                }
                //--- EventType: webrtcup
                else if(eventType === "webrtcup") {
                    if(cHandler) {
                        console.info("*** webrtcup *** details:", JSON.stringify(details));
                        cHandler.webrtcState(true);
                    } else{
                        console.error("### Error case(webrtcup). cid=", cid);
                    }
                    continue;
                }
                //--- EventType: hangup
                else if(eventType === "hangup") {
                    if(cHandler !== null && cHandler !== undefined) {
                        console.info("*** hangup *** reason:", details["reason"]);
                        cHandler.webrtcState(false);
                        cHandler.hangup();
                    } else {
                        console.warn("### Ignore case(hangup). cid=", cid);
                    }
                    continue;
                }
                //--- EventType: media
                else if(eventType === "media") {
                    if(cHandler !== null && cHandler !== undefined) {
                        console.info("*** media *** data:", JSON.stringify(details));
                        cHandler.mediaState(details["type"], details["receiving"]);
                    } else {
                        console.error("### Error case(media). cid=", cid);
                    }
                    continue;
                }
                //--- EventType: unknown
                else {
                    console.error("*** Unknown event_type: ", eventType);
                }
            }
            //--- Event: videocall
            else if(eventItem === "videocall") {
                console.info("*** videocall event *** data:", JSON.stringify(details));
                if(!cHandler) {
                    console.error("### Error case(event) channel handler not exist..");
                } else {
                    cHandler.onmessage(details, details["jsep"]);
                }
                continue;
            }
            //--- Event: videoconf
            else if(eventItem === "videoconf") {
                console.info("*** videoconf event *** data:", JSON.stringify(details));
                if(!cHandler) {
                    console.error("### Error case(event) channel handler not exist..");
                } else {
                    cHandler.onmessage(details, details["jsep"]);
                }
                continue;
            }
            //--- Event: recording
            else if(eventItem === "recording") {
                console.info("*** recording event *** data:", JSON.stringify(details));
                if(!cHandler) {
                    console.error("### Error case(event) channel handler not exist..");
                } else {
                    cHandler.onmessage(details, details["jsep"]);
                }
                continue;
            }
            //--- Event: chatting
            else if(eventItem === "chatting") {
                console.info("*** chatting event *** data:", JSON.stringify(details));
                if(!cHandler) {
                    console.error("### Error case(event) channel handler not exist..");
                } else {
                    cHandler.onmessage(details, details["jsep"]);
                }
                continue;
            }
            //--- Event: control
            else if(eventItem === "control") {
                console.info("*** control event *** data:", JSON.stringify(details));
                var target = details["target"];

                //--- EventType: init
                if(eventType === "init") {
                    //--- TODO: 추후 처리 종류가 늘어나면 그때 분기 처리 추가..
                    //--- 현재는 VideoCall handler 생성만 존재
                    if(target === "videocall") {
                        localFeedForVideoCall(false);
                    } else {
                        console.error("Unknown control target.. target=", target);
                    }
                }
                //--- EventType: refresh
                else if(eventType === "refresh") {
                    getUserList();
                }
                //--- EventType: unknown
                else {
                    console.error("Unknown control event_type.. event_type=", eventType);
                }
            }
            //--- Event: unknown
            else {
                console.error("*** Unknown event: ", eventItem);
            }
        }
    } else if(result === "error" || result === "failure") {
        var reason = json["data"]["reason"];
        var errorCode = json["data"]["error_code"];
        console.error("Receive Error event.. reason:", reason);
        if(errorCode === 4104) {
            // bootbox.alert({
            //     message: "서버 연결 오류. 관리자에게 문의하세요.",
            //     callback: function() {
            //         window.location.reload();
            //     }
            // });
            window.location.reload();
        }
    } else {
        console.error("Unknown event.. result:", result);
    }
}

function doSessionDestory() {
    /* 로그아웃시 */
    console.log("doSessionDestory");
    //console.log("========== Call logout!!! ==========");
    var request = { "username": userId };
    httpAPICall("/onsvc/logout", {
        verb: 'POST',
        body: request,
        success: function(json) {
            //console.log("Destroyed session:");
            console.debug(json);
            token = null;
            userId = null;
            window.location.reload();
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
            window.location.reload();
        }
    });
}

function setCookie(token) {
    console.log("setCookie")
    var exdate = new Date();
    exdate.setMinutes(exdate.getMinutes + 60);
    var cookie = "";
    cookie += "onsvc=" + token;
    cookie += ";expires=" + exdate.toUTCString();;
    document.cookie = cookie;
}


function showDashboard() {
    console.log(showDashboard = "showDashboard(21)");
    // Make sure the browser supports WebRTC
    if(!isWebrtcSupported()) {
        bootbox.alert("No WebRTC support... ");
        return;
    }
    afterSessionCreationSuccess();

    $('#create_room').unbind();
    $('#create_room').click(openCreateRoomModal);
    $("#create_room_close_btn").unbind();
    $("#create_room_close_btn").click(closeCreateRoomModal);
}

function doCall() {
    console.log("doCall")
    localFeedForVideoCall(true);
}

function openCreateRoomModal() {
    /* 회의방 생성 클릭시*/ 
    console.log("openCreateRoomModal");
    $("#room_title_input").val("");
    $('#room_group_input *').remove();
    var groups = getGroupList();
    for(var i in groups) {
        var groupInfo = groups[i];
        $('#room_group_input').append('<option value="' + groupInfo["id"] + '"' + (i === 0 ?' selected="selected"':'') + '>' + groupInfo["name"] +'</option>');
    }

    $("#create_room_btn").unbind();
    $("#create_room_btn").click(doCreateRoom);

    $("#createRoomModal").css("display", "block");
}

function closeCreateRoomModal() {
    console.log("closeCreateRoomModal");
    $("#createRoomModal").css("display", "none");
}

function doCreateRoom() {
    console.log("doCreateRoom")
    var title = $("#room_title_input").val();
    if(title === "") {
        alert("회의방 제목이 입력되지 않았습니다.");
        return;
    }
    var groupId = $("#room_group_input").val();

    sendCreateRoomRequest(title, groupId);
    closeCreateRoomModal();
}

//----- Screen Sharing
function createScreenSharingHandler() {
    console.log("createScreenSharingHandler");
    localFeedForScreenSharing();
}

var isWebrtcSupported = function() {
    console.log("isWebrtcSupported");
	return !!window.RTCPeerConnection;
};

var userList;
var groupDataList;
function getUserList() {
    console.log("getUserList");
    httpAPICall("/onsvc/groupdata", {
        verb: 'GET',
        success: function(json) {
            console.debug(JSON.stringify(json));
            if(json['result'] === "group_data_list") {
                $('#friend_list *').remove();
                groupDataList = json['data']['group_data_list'];

                $('#friend_list').append(
                    '<div class="dashboard-friend-top">' +
                        '<div class="dashboard-friend-item dashboard-font" id="user-id">' +
                            '<div class="dashboard-friend-name">' +
                                '이름' +
                            '</div>' +
                            '<div class="dashboard-friend-label">' +
                                '<input class="level-title-top" value="" id="user_call" readonly>' +
                            '</div>' +
                        '</div>' +
                        '<div class="dashboard-friend-item dashboard-font dashboard-friend-desc">' +
                            '접속 상태' +
                        '</div>' +
                        '<div class="call dashboard-friend-item">' +
                        '</div>' +
                    '</div>'
                );

                for(var i in groupDataList) {
                    var groupData = groupDataList[i];
                    var levelGroupList = groupData['level_group_list'];
                    for(var i in levelGroupList) {
                        var memberList = levelGroupList[i]['member_list'];
                        var levelTitle = levelGroupList[i]['level_title'];
                        var levelColor = levelGroupList[i]['level_color'];
                        for(var memNum in memberList) {
                            var member = memberList[memNum];
                            if(member['id'] === userId) {
                                //--- Add user info
                                $('#friend_list').append(getDashboardFriendHtml(member['name'], levelTitle, levelColor, true, true));
                            }
                        }
                    }
                }

                for(var i in groupDataList) {
                    var groupData = groupDataList[i];

                    var groupId = groupData['group_id'];
                    var groupName = groupData['group_name'];
                    var groupAdminId = groupData['group_admin_user_id'];
                    var groupMemberCount = groupData['group_member_count'];
                    var groupMemberMaxLevel = groupData['group_member_max_level'];
                    var levelGroupList = groupData['level_group_list'];

                    //--- Add member info
                    for(var level=groupMemberMaxLevel; level>=0; level--) {
                        for(var i in levelGroupList) {
                            if(levelGroupList[i]['level'] === level) {
                                var memberList = levelGroupList[i]['member_list'];
                                var levelTitle = levelGroupList[i]['level_title'];
                                var levelColor = levelGroupList[i]['level_color'];
                                for(var memNum in memberList) {
                                    var member = memberList[memNum];
                                    if(member['id'] === userId) {
                                        continue;
                                    }
                                    $('#friend_list').append(getDashboardFriendHtml(member['name'], levelTitle, levelColor, member['login'], false));
                                }
                            }
                        }
                    }
                }
                getConfRoomList();
            }
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else
                bootbox.alert(textStatus + ": " + errorThrown);
        }
    });
}

function getDashboardFriendHtml(name, levelTitle, levelColor, isOnline, isSelf) {
    console.log("getDashboardFriendHtml");
    var statusText;
    var videoCallBtnHtml;
    if(isOnline) {
        statusText = '온라인'
        videoCallBtnHtml = '<input class="enable-call type="call" value="VideoCall" id="user_call" onclick="userOnclickEvent(this)" readonly>';
        if(isSelf) {
            statusText = '온라인(나)'
            videoCallBtnHtml = '';
        }
    } else {
        statusText = '오프라인'
        videoCallBtnHtml = '<input class="disable-call type="" value="VideoCall" id="user_call" readonly>';
    }

    var html = '<div class="dashboard-friend">' +
                    '<div class="dashboard-friend-item dashboard-font" id="user-id">' +
                        '<div class="dashboard-friend-name">' +
                            name +
                        '</div>' +
                        '<div class="dashboard-friend-label">' +
                            '<input class="level-title" value="' + levelTitle + '" id="user_call" style="background:' + levelColor + '" readonly>' +
                        '</div>' +
                    '</div>' +
                    '<div class="dashboard-friend-item dashboard-font dashboard-friend-desc">' +
                        statusText +
                    '</div>' +
                    '<div class="dashboard-friend-item">' +
                        videoCallBtnHtml +
                    '</div>' +
                '</div>';
    return html;
}

function getGroupList() {
    console.log("getGroupList");
    var groups = [];
    for(var i in groupDataList) {
        var groupData = groupDataList[i];
        var groupId = groupData['group_id'];
        var groupName = groupData['group_name'];
        groups[i] = { id: groupId, name: groupName };
    }
    return groups;
}

function userOnclickEvent(item) {
    console.log("userOnclickEvent");
    var userName;
    var ppNode = item.parentNode.parentNode;
    
    var list = ppNode.childNodes;
    for(var i=0; i<list.length; i++) {
        if(list[i].getAttribute('id') === "user-id") {
            userName = list[i].childNodes[0].childNodes[0].nodeValue;
        }
    }
    //console.log("userName =" + userName);
    var login;
    for(var i in groupDataList) {
        var groupData = groupDataList[i];
        var levelGroupList = groupData['level_group_list'];

        for(var i in levelGroupList) {
            var memberList = levelGroupList[i]['member_list'];
            for(var memNum in memberList) {
                var member = memberList[memNum];
                if(member['name'] === userName) {
                    calleeId = member['id'];
                    calleeName = member['name'];
                    login = member['login'];
                    break;
                }
            }
        }
    }
    bootbox.confirm({
        message: '['+ userName + '] 님에게 영상통화를 요청하시겠습니까?',
        buttons: {
            cancel: {
                label: "Cancel",
            },
            confirm: {
                label: "Voice Call",
                className: 'btn-info',
            }
        },
        callback: function(result) {
            if(result) {
                if(!login) {
                    //console.log(JSON.stringify(groupDataList)); // temp
                    bootbox.alert("접속중인 사용자가 아닙니다!");
                    calleeId = null;
                    calleeName = null;
                    return;
                }
                // *** TODO!!! 기본동작 확인 이후 추가할 것!
                addCallerLayout();
                doCall();
            } else {
                calleeId = null;
                calleeName = null;
            }
        }
    });
}

var roomList;
function getConfRoomList() {
    console.log("getConfRoomList");
    httpAPICall("/onsvc/videoconf/roomlist", {
        verb: 'GET',
        success: function(json) {
            console.debug(JSON.stringify(json));
            if(json['result'] === "success") {
                $('#room_list *').remove();
                $('#room_list').append(
                    '<div class="dashboard-room-top">' +
                        '<div class="dashboard-friend-item dashboard-font dashboard-room-title" id="room-title">' +
                            '회의방 제목' +
                        '</div>' +
                        '<div class="dashboard-friend-item dashboard-font dashboard-room-owner">' +
                            '주최자' +
                        '</div>' +
                        '<div class="dashboard-friend-item dashboard-font dashboard-room-group">' +
                            '그룹' +
                        '</div>' +
                        '<div class="dashboard-friend-item dashboard-font dashboard-room-createtime">' +
                            '생성 시간' +
                        '</div>' +
                    '</div>'
                );

                roomList = json['data']['room_list'];

                for(var i in roomList) {
                    var roomInfo = roomList[i];

                    var roomId = roomInfo['room_id'];
                    var roomTitle = roomInfo['room_title'];
                    var roomOwnerId = roomInfo['room_owner_id'];
                    var roomOwnerName = roomInfo['room_owner_name'];
                    var roomGroupId = roomInfo['room_group_id'];
                    var roomGroupName = "";
                    var groups = getGroupList();
                    for(var i in groups) {
                        var groupInfo = groups[i];
                        if(groupInfo['id'] === roomGroupId) {
                            roomGroupName = groupInfo['name'];
                            break;
                        }
                    }
                    var roomCreateTime = roomInfo['create_time'].replace('T', ' '); // create_time: 2021-12-28T09:42:34.312

                    //--- Add room info
                    if(roomOwnerId === userId) {
                        $('#room_list').append(
                            '<div class="dashboard-room" id="' + roomId + '" onclick="roomOnclickEvent(this)">' +
                                '<div class="dashboard-friend-item dashboard-font dashboard-room-title" id="room-title">' +
                                    roomTitle +
                                '</div>' +
                                '<div class="dashboard-friend-item dashboard-font dashboard-room-owner">' +
                                    roomOwnerName +
                                '</div>' +
                                '<div class="dashboard-friend-item dashboard-font dashboard-room-group">' +
                                    roomGroupName +
                                '</div>' +
                                '<div class="dashboard-friend-item dashboard-font dashboard-room-createtime">' +
                                    roomCreateTime +
                                '</div>' +
                                '<div class="dashboard-room-btns">' +
                                    '<input class="invite-btn" value="Invite Code" onclick="getInviteCode(' + roomId + ')">' +
                                '</div>' +
                            '</div>'
                        );
                        $('.dashboard-room-btns').click(function(e) {
                            e.stopPropagation();
                        });
                    } else {
                        $('#room_list').append(
                            '<div class="dashboard-room" id="' + roomId + '" onclick="roomOnclickEvent(this)">' +
                                '<div class="dashboard-friend-item dashboard-font dashboard-room-title" id="room-title">' +
                                    roomTitle +
                                '</div>' +
                                '<div class="dashboard-friend-item dashboard-font dashboard-room-owner">' +
                                    roomOwnerName +
                                '</div>' +
                                '<div class="dashboard-friend-item dashboard-font dashboard-room-group">' +
                                    roomGroupName +
                                '</div>' +
                                '<div class="dashboard-friend-item dashboard-font dashboard-room-createtime">' +
                                    roomCreateTime +
                                '</div>' +
                            '</div>'
                        );
                    }
                }  
            }
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else
                bootbox.alert(textStatus + ": " + errorThrown);
        }
    });
}

function isRoomOwnerId(roomId, userId) {
    console.log("isRoomOwnerId");
    //--- 최고관리자인 경우
    if(superAdmin) {
        return true;
    }

    //--- Get RoomInfo
    var targetRoomInfo = null;
    for(var i in roomList) {
        var roomInfo = roomList[i];
        if(parseInt(roomId) === roomInfo['room_id']) {
            targetRoomInfo = roomInfo;
            break;
        }

        var roomGroupId = roomInfo['room_group_id'];
    }

    if(targetRoomInfo != null) {
        //--- 회의방의 개설자인 경우
        if(userId === targetRoomInfo['room_owner_id']) {
            return true;
        }

        //--- 회의방이 속한 그룹의 관리자인 경우
        var roomGroupId = targetRoomInfo['room_group_id'];
        //--- Get GroupAdmin
        var adminList = getGroupAdminList(roomGroupId);
        for(var i in adminList) {
            if(adminList[i]['id'] === userId) {
                return true;
            }
        }
    }

    return false;
}

function getGroupAdminList(groupId) {
    console.log("getGroupAdminList");
    for(var i in groupDataList) {
        var groupData = groupDataList[i];
        if(groupId === groupData['group_id']) {
            var levelGroupList = groupData['level_group_list'];
            for(var i in levelGroupList) {
                var memberList = levelGroupList[i]['member_list'];
                var levelTitle = levelGroupList[i]['level_title'];
                if(levelTitle === 'Admin') {
                    return memberList;
                }
            }
        }
    }
    return [];
}

function roomOnclickEvent(item) {
    console.log("roomOnclickEvent");
    var roomId = item.getAttribute('id');
    var list = item.childNodes;
    for(var i=0; i<list.length; i++) {
        if(list[i].getAttribute('id') === "room-title") {
            roomTitle = list[i].childNodes[0].nodeValue;
            break;
        }
    }
    if(isRoomOwnerId(roomId, userId)) {
        bootbox.dialog({
            message: "회의방 '"+ roomTitle + "'에 입장하시겠습니까?",
            buttons: {
                noclose: {
                    label: "Delete",
                    className: 'btn-danger',
                    callback: function() {
                        sendDestroyRoomRequest(roomId);
                    }
                },
                cancel: {
                    label: "Cancel",
                    className: 'btn-default',
                    callback: function() {
                        return;
                    }
                },
                ok: {
                    label: "Enter",
                    className: 'btn-info',
                    callback: function() {
                        localFeedForVideoConf(roomId);
                    }
                }
            }
        });
    } else {
        bootbox.dialog({
            message: "회의방 '"+ roomTitle + "'에 입장하시겠습니까?",
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: 'btn-default',
                    callback: function() {
                        return;
                    }
                },
                ok: {
                    label: "Enter",
                    className: 'btn-info',
                    callback: function() {
                        localFeedForVideoConf(roomId);
                    }
                }
            }
        });
    }
}

//--- For VideoCall
function doHangup() {
    console.log("doHangup");
	// Hangup a call
    var request = { data: null };
    httpAPICall("/onsvc/videocall/hangup", {
        verb: 'POST',
        body: request,
        success: function(json) {
            console.debug(json);
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
	videocall.hangup();
}

//--- For VideoConf
function doHangupVideoConf() {
    console.log("doHangupVideoConf");
	// Hangup a call
    var request = { data: null };
    httpAPICall("/onsvc/videoconf/hangup", {
        verb: 'POST',
        body: request,
        success: function(json) {
            console.debug(json);
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });

    if(recordplay) {
        recordplay.hangup();
    }
    if(textroom) {
        textroom.hangup();
    }
    if(sfutest) {
        sfutest.hangup();
    }
    if(screentest) {
        screentest.hangup();
    }
    sharingOn = false;
}

//--- For ScreenSharing
function doStopScreenSharing() {
    console.log("doStopScreenSharing");
	// Hangup a call
    var data = { cid: screentest.getId(), type: "stop" };
    var request = { data: data };
    httpAPICall("/onsvc/videoconf/screensharing", {
        verb: 'POST',
        body: request,
        success: function(json) {
            console.debug(json);
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
	screentest.hangup();
    sharingOn = false;
}

function _sendTrickleCandidate(channelId, candidate) {
    console.log("_sendTrickleCandidate");
    var data = { cid: channelId, candidate};
    var request = { type: "candidate", data };
    httpAPICall("/onsvc/trickle", {
        verb: 'POST',
        body: request,
        success: function(json) {
            console.debug(json);
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
}

function isGetUserMediaAvailable() {
    console.log("isGetUserMediaAvailable");
	return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
};


function _prepareWebrtc(channelId, offer, callbacks) {
    console.log("_prepareWebrtc");
    
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : webrtcError;
    var jsep = callbacks.jsep;
    if(offer && jsep) {
        console.error("Provided a JSEP to a createOffer");
        callbacks.error("Provided a JSEP to a createOffer");
        return;
    } else if(!offer && (!jsep || !jsep.type || !jsep.sdp)) {
        console.error("A valid JSEP is required for createAnswer");
        callbacks.error("A valid JSEP is required for createAnswer");
        return;
    }
    /* Check that callbacks.media is a (not null) Object */
    callbacks.media = (typeof callbacks.media === 'object' && callbacks.media) ? callbacks.media : { audio: true, video: true };
    var media = callbacks.media;
    var cHandle = channels[channelId];
    if(!cHandle || !cHandle.webrtcStuff) {
        console.warn("Invalid handle");
        callbacks.error("Invalid handle");
        return;
    } 
    var config = cHandle.webrtcStuff;
    config.trickle = _isTrickleEnabled(callbacks.trickle);
    // Are we updating a session?
    if(!config.pc) {
        // Nope, new PeerConnection
        media.update = false;
        media.keepAudio = false;
        media.keepVideo = false;
    } else {
        //console.log("Updating existing media session");
        media.update = true;
        // Check if there's anything to add/remove/replace, or if we
        // can go directly to preparing the new SDP offer or answer
        if(callbacks.stream) {
            // External stream: is this the same as the one we were using before?
            if(callbacks.stream !== config.myStream) {
                //console.log("Renegotiation involves a new external stream");
            }
        } else {
            // Check if there are changes on audio
            if(media.addAudio) {
                media.keepAudio = false;
                media.replaceAudio = false;
                media.removeAudio = false;
                media.audioSend = true;
                if(config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
                    console.error("Can't add audio stream, there already is one");
                    callbacks.error("Can't add audio stream, there already is one");
                    return;
                }
            } else if(media.removeAudio) {
                media.keepAudio = false;
                media.replaceAudio = false;
                media.addAudio = false;
                media.audioSend = false;
            } else if(media.replaceAudio) {
                media.keepAudio = false;
                media.addAudio = false;
                media.removeAudio = false;
                media.audioSend = true;
            }
            if(!config.myStream) {
                // No media stream: if we were asked to replace, it's actually an "add"
                if(media.replaceAudio) {
                    media.keepAudio = false;
                    media.replaceAudio = false;
                    media.addAudio = true;
                    media.audioSend = true;
                }
                if(_isAudioSendEnabled(media)) {
                    media.keepAudio = false;
                    media.addAudio = true;
                }
            } else {
                if(!config.myStream.getAudioTracks() || config.myStream.getAudioTracks().length === 0) {
                    // No audio track: if we were asked to replace, it's actually an "add"
                    if(media.replaceAudio) {
                        media.keepAudio = false;
                        media.replaceAudio = false;
                        media.addAudio = true;
                        media.audioSend = true;
                    }
                    if(_isAudioSendEnabled(media)) {
                        media.keepAudio = false;
                        media.addAudio = true;
                    }
                } else {
                    // We have an audio track: should we keep it as it is?
                    if(_isAudioSendEnabled(media) &&
                            !media.removeAudio && !media.replaceAudio) {
                        media.keepAudio = true;
                    }
                }
            }
            // Check if there are changes on video
            if(media.addVideo) {
                media.keepVideo = false;
                media.replaceVideo = false;
                media.removeVideo = false;
                media.videoSend = true;
                if(config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
                    console.error("Can't add video stream, there already is one");
                    callbacks.error("Can't add video stream, there already is one");
                    return;
                }
            } else if(media.removeVideo) {
                media.keepVideo = false;
                media.replaceVideo = false;
                media.addVideo = false;
                media.videoSend = false;
            } else if(media.replaceVideo) {
                media.keepVideo = false;
                media.addVideo = false;
                media.removeVideo = false;
                media.videoSend = true;
            }
            if(!config.myStream) {
                // No media stream: if we were asked to replace, it's actually an "add"
                if(media.replaceVideo) {
                    media.keepVideo = false;
                    media.replaceVideo = false;
                    media.addVideo = true;
                    media.videoSend = true;
                }
                if(_isVideoSendEnabled(media)) {
                    media.keepVideo = false;
                    media.addVideo = true;
                }
            } else {
                if(!config.myStream.getVideoTracks() || config.myStream.getVideoTracks().length === 0) {
                    // No video track: if we were asked to replace, it's actually an "add"
                    if(media.replaceVideo) {
                        media.keepVideo = false;
                        media.replaceVideo = false;
                        media.addVideo = true;
                        media.videoSend = true;
                    }
                    if(_isVideoSendEnabled(media)) {
                        media.keepVideo = false;
                        media.addVideo = true;
                    }
                } else {
                    // We have a video track: should we keep it as it is?
                    if(_isVideoSendEnabled(media) && !media.removeVideo && !media.replaceVideo) {
                        media.keepVideo = true;
                    }
                }
            }
            // Data channels can only be added
            if(media.addData) {
                media.data = true;
            }
        }
        // If we're updating and keeping all tracks, let's skip the getUserMedia part
        if((_isAudioSendEnabled(media) && media.keepAudio) &&
                (_isVideoSendEnabled(media) && media.keepVideo)) {
            cHandle.consentDialog(false);
            _streamsDone(channelId, jsep, media, callbacks, config.myStream);
            return;
        }
    }
    // If we're updating, check if we need to remove/replace one of the tracks
    if(media.update && (!config.streamExternal || (config.streamExternal && (media.replaceAudio || media.replaceVideo)))) {
        if(media.removeAudio || media.replaceAudio) {
            if(config.myStream && config.myStream.getAudioTracks() && config.myStream.getAudioTracks().length) {
                var at = config.myStream.getAudioTracks()[0];
                //console.log("Removing audio track:", at);
                config.myStream.removeTrack(at);
                try {
                    at.stop();
                } catch(e) {}
            }
            if(config.pc.getSenders() && config.pc.getSenders().length) {
                var ra = true;
                if(media.replaceAudio && unifiedPlan) {
                    // We can use replaceTrack
                    ra = false;
                }
                if(ra) {
                    for(var asnd of config.pc.getSenders()) {
                        if(asnd && asnd.track && asnd.track.kind === "audio") {
                            //console.log("Removing audio sender:", asnd);
                            config.pc.removeTrack(asnd);
                        }
                    }
                }
            }
        }
        if(media.removeVideo || media.replaceVideo) {
            if(config.myStream && config.myStream.getVideoTracks() && config.myStream.getVideoTracks().length) {
                config.myStream.getVideoTracks().forEach(function(vt) {
                    //console.log("Removing video track:", vt);
                    config.myStream.removeTrack(vt);
                    try {
                        vt.stop();
                    } catch(e) {}
                });
            }
            if(config.pc.getSenders() && config.pc.getSenders().length) {
                var rv = true;
                if(media.replaceVideo && unifiedPlan) {
                    // We can use replaceTrack
                    rv = false;
                }
                if(rv) {
                    for(var vsnd of config.pc.getSenders()) {
                        if(vsnd && vsnd.track && vsnd.track.kind === "video") {
                            //console.log("Removing video sender:", vsnd);
                            config.pc.removeTrack(vsnd);
                        }
                    }
                }
            }
        }
    }
    // Was a MediaStream object passed, or do we need to take care of that?
    if(callbacks.stream) {
        var stream = callbacks.stream;
        //console.log("MediaStream provided by the application");
        console.debug(stream);
        // If this is an update, let's check if we need to release the previous stream
        if(media.update && config.myStream && config.myStream !== callbacks.stream && !config.streamExternal && !media.replaceAudio && !media.replaceVideo) {
            // We're replacing a stream we captured ourselves with an external one
            stopAllTracks(config.myStream);
            config.myStream = null;
        }
        // Skip the getUserMedia part
        config.streamExternal = true;
        cHandle.consentDialog(false);
        _streamsDone(channelId, jsep, media, callbacks, stream);
        return;
    }
    if(_isAudioSendEnabled(media) || _isVideoSendEnabled(media)) {
        if(!isGetUserMediaAvailable()) {
            callbacks.error("getUserMedia not available");
            return;
        }
        var constraints = { mandatory: {}, optional: []};
        cHandle.consentDialog(true);
        var audioSupport = _isAudioSendEnabled(media);
        if(audioSupport && media && typeof media.audio === 'object')
            audioSupport = media.audio;
        var videoSupport = _isVideoSendEnabled(media);
        if(videoSupport && media) {
            var simulcast = (callbacks.simulcast === true);
            var simulcast2 = (callbacks.simulcast2 === true);
            if((simulcast || simulcast2) && !jsep && !media.video)
                media.video = "hires";
            if(media.video && media.video != 'screen' && media.video != 'window') {
                if(typeof media.video === 'object') {
                    videoSupport = media.video;
                } else {
                    var width = 0;
                    var height = 0, maxHeight = 0;
                    if(media.video === 'lowres') {
                        // Small resolution, 4:3
                        height = 240;
                        maxHeight = 240;
                        width = 320;
                    } else if(media.video === 'lowres-16:9') {
                        // Small resolution, 16:9
                        height = 180;
                        maxHeight = 180;
                        width = 320;
                    } else if(media.video === 'hires' || media.video === 'hires-16:9' || media.video === 'hdres') {
                        // High(HD) resolution is only 16:9
                        height = 720;
                        maxHeight = 720;
                        width = 1280;
                    } else if(media.video === 'fhdres') {
                        // Full HD resolution is only 16:9
                        height = 1080;
                        maxHeight = 1080;
                        width = 1920;
                    } else if(media.video === '4kres') {
                        // 4K resolution is only 16:9
                        height = 2160;
                        maxHeight = 2160;
                        width = 3840;
                    } else if(media.video === 'stdres') {
                        // Normal resolution, 4:3
                        height = 480;
                        maxHeight = 480;
                        width = 640;
                    } else if(media.video === 'stdres-16:9') {
                        // Normal resolution, 16:9
                        height = 360;
                        maxHeight = 360;
                        width = 640;
                    } else {
                        //console.log("Default video setting is stdres 4:3");
                        height = 480;
                        maxHeight = 480;
                        width = 640;
                    }
                    //console.log("Adding media constraint:", media.video);
                    videoSupport = {
                        'height': {'ideal': height},
                        'width': {'ideal': width}
                    };
                    //console.log("Adding video constraint:", videoSupport);
                }
            } else if(media.video === 'screen' || media.video === 'window') {
                if(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                    // The new experimental getDisplayMedia API is available, let's use that
                    // https://groups.google.com/forum/#!topic/discuss-webrtc/Uf0SrR4uxzk
                    // https://webrtchacks.com/chrome-screensharing-getdisplaymedia/
                    constraints.video = {};
                    if(media.screenshareFrameRate) {
                        constraints.video.frameRate = media.screenshareFrameRate;
                    }
                    if(media.screenshareHeight) {
                        constraints.video.height = media.screenshareHeight;
                    }
                    if(media.screenshareWidth) {
                        constraints.video.width = media.screenshareWidth;
                    }
                    constraints.audio = media.captureDesktopAudio;
                    navigator.mediaDevices.getDisplayMedia(constraints)
                        .then(function(stream) {
                            cHandle.consentDialog(false);
                            if(_isAudioSendEnabled(media) && !media.keepAudio) {
                                navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                                .then(function (audioStream) {
                                    stream.addTrack(audioStream.getAudioTracks()[0]);
                                    _streamsDone(channelId, jsep, media, callbacks, stream);
                                })
                            } else {
                                _streamsDone(channelId, jsep, media, callbacks, stream);
                            }
                        }, function (error) {
                            cHandle.consentDialog(false);
                            callbacks.error(error);
                        });

                    return;
                }

                // We're going to try and use the extension for Chrome 34+, the old approach
                // for older versions of Chrome, or the experimental support in Firefox 33+
                
 
                function callbackUserMedia(error, stream) {
                    console.log("callbackUserMedia");
                    cHandle.consentDialog(false);
                    if(error) {
                        callbacks.error(error);
                    } else {
                    }
                }
               
                function getScreenMedia(constraints, gsmCallback, useAudio) {
                    console.log(getScreenMedia = "getScreenMedia(42)");
                    //console.log("Adding media constraint (screen capture)");
                    console.debug(constraints);
                    navigator.mediaDevices.getUserMedia(constraints)
                        .then(function(stream) {
                            if(useAudio) {
                                navigator.mediaDevices.getUserMedia({ audio: true, video: false })
                                .then(function (audioStream) {
                                    stream.addTrack(audioStream.getAudioTracks()[0]);
                                    gsmCallback(null, stream);
                                })
                            } else {
                                gsmCallback(null, stream);
                            }
                        })
                        .catch(function(error) { cHandle.consentDialog(false); gsmCallback(error); });
                }
                if(adapter.browserDetails.browser === 'chrome') {
                    var chromever = adapter.browserDetails.version;
                    var maxver = 33;
                    if(window.navigator.userAgent.match('Linux'))
                        maxver = 35;	// "known" crash in chrome 34 and 35 on linux
                    if(chromever >= 26 && chromever <= maxver) {
                        // Chrome 26->33 requires some awkward chrome://flags manipulation
                        constraints = {
                            video: {
                                mandatory: {
                                    googLeakyBucket: true,
                                    maxWidth: window.screen.width,
                                    maxHeight: window.screen.height,
                                    minFrameRate: media.screenshareFrameRate,
                                    maxFrameRate: media.screenshareFrameRate,
                                    chromeMediaSource: 'screen'
                                }
                            },
                            audio: _isAudioSendEnabled(media) && !media.keepAudio
                        };
                        getScreenMedia(constraints, callbackUserMedia);
                    } else {
                        // Chrome 34+ requires an extension
                        _extension.getScreen(function (error, sourceId) {
                            if (error) {
                                cHandle.consentDialog(false);
                                return callbacks.error(error);
                            }
                            constraints = {
                                audio: false,
                                video: {
                                    mandatory: {
                                        chromeMediaSource: 'desktop',
                                        maxWidth: window.screen.width,
                                        maxHeight: window.screen.height,
                                        minFrameRate: media.screenshareFrameRate,
                                        maxFrameRate: media.screenshareFrameRate,
                                    },
                                    optional: [
                                        {googLeakyBucket: true},
                                        {googTemporalLayeredScreencast: true}
                                    ]
                                }
                            };
                            constraints.video.mandatory.chromeMediaSourceId = sourceId;
                            getScreenMedia(constraints, callbackUserMedia,
                                _isAudioSendEnabled(media) && !media.keepAudio);
                        });
                    }
                } else if(adapter.browserDetails.browser === 'firefox') {
                    if(adapter.browserDetails.version >= 33) {
                        // Firefox 33+ has experimental support for screen sharing
                        constraints = {
                            video: {
                                mozMediaSource: media.video,
                                mediaSource: media.video
                            },
                            audio: _isAudioSendEnabled(media) && !media.keepAudio
                        };
                        getScreenMedia(constraints, function (err, stream) {
                            callbackUserMedia(err, stream);
                            // Workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=1045810
                            if (!err) {
                                var lastTime = stream.currentTime;
                                var polly = window.setInterval(function () {
                                    if(!stream)
                                        window.clearInterval(polly);
                                    if(stream.currentTime == lastTime) {
                                        window.clearInterval(polly);
                                        if(stream.onended) {
                                            stream.onended();
                                        }
                                    }
                                    lastTime = stream.currentTime;
                                }, 500);
                            }
                        });
                    } else {
                        var error = new Error('NavigatorUserMediaError');
                        error.name = 'Your version of Firefox does not support screen sharing, please install Firefox 33 (or more recent versions)';
                        cHandle.consentDialog(false);
                        callbacks.error(error);
                        return;
                    }
                }
                return;
            }
        }
        // If we got here, we're not screensharing
        if(!media || media.video !== 'screen') {
            // Check whether all media sources are actually available or not
            navigator.mediaDevices.enumerateDevices().then(function(devices) {
                var audioExist = devices.some(function(device) {
                    return device.kind === 'audioinput';
                }),
                videoExist = _isScreenSendEnabled(media) || devices.some(function(device) {
                    return device.kind === 'videoinput';
                });

                // Check whether a missing device is really a problem
                var audioSend = _isAudioSendEnabled(media);
                var videoSend = _isVideoSendEnabled(media);
                var needAudioDevice = _isAudioSendRequired(media);
                var needVideoDevice = _isVideoSendRequired(media);
                if(audioSend || videoSend || needAudioDevice || needVideoDevice) {
                    // We need to send either audio or video
                    var haveAudioDevice = audioSend ? audioExist : false;
                    var haveVideoDevice = videoSend ? videoExist : false;
                    if(!haveAudioDevice && !haveVideoDevice) {
                        // FIXME Should we really give up, or just assume recvonly for both?
                        cHandle.consentDialog(false);
                        callbacks.error('No capture device found');
                        return false;
                    } else if(!haveAudioDevice && needAudioDevice) {
                        cHandle.consentDialog(false);
                        callbacks.error('Audio capture is required, but no capture device found');
                        return false;
                    } else if(!haveVideoDevice && needVideoDevice) {
                        cHandle.consentDialog(false);
                        callbacks.error('Video capture is required, but no capture device found');
                        return false;
                    }
                }

                var gumConstraints = {
                    audio: (audioExist && !media.keepAudio) ? audioSupport : false,
                    video: (videoExist && !media.keepVideo) ? videoSupport : false
                };
                console.debug("getUserMedia constraints", gumConstraints);
                if (!gumConstraints.audio && !gumConstraints.video) {
                    cHandle.consentDialog(false);
                    _streamsDone(channelId, jsep, media, callbacks, stream);
                } else {
                    navigator.mediaDevices.getUserMedia(gumConstraints)
                        .then(function(stream) {
                            var dest = null;
                            if(gumConstraints.audio) {
                                //--- Audio pitch change effect
                                var audioCtx = new AudioContext();
                                var source = audioCtx.createMediaStreamSource(stream);
                                dest = audioCtx.createMediaStreamDestination();
                                var pitchEffect = new Jungle(audioCtx);
                                var compressor = audioCtx.createDynamicsCompressor();
                                source.connect(pitchEffect.input);
                                pitchEffect.output.connect(compressor);
                                pitchEffect.setPitchOffset(pitchVal);
                                compressor.connect(dest);
                            }
                            if(videoSupport === true) {
                                //--- FIXME: Record 요청일 때만 처리하려는 부분. 추후 개선 필요
                                stopAllTracks(stream);
                                stream = mystream.clone();
                                cHandle.consentDialog(false);
                                _streamsDone(channelId, jsep, media, callbacks, stream);
                            } else if(gumConstraints.video) {
                                var canvasWidth = videoSupport['width']['ideal'];
                                var canvasHeight = videoSupport['height']['ideal'];
                                $('#videolocal *').remove();
                                $('#videolocal').append(
                                    '<video class="hide rounded centered" id="origvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>');
                                $('#videolocal').append(
                                    '<canvas class="hide" id="mycanvas" \
                                    width="' + videoSupport['width']['ideal'] +'" height="' + videoSupport['height']['ideal'] + '" \
                                    style="display: block; margin: auto; padding: 0"></canvas>');
                                attachMediaStream($('#origvideo').get(0), stream);
                                $('#origvideo').get(0).muted = "muted";
                                $('#origvideo').get(0).play();
                                $('#origvideo').get(0).addEventListener('play', function() {
                                    var origVideo = this;
                                    var canvas = document.getElementById('mycanvas');
                                    var context = canvas.getContext('2d');
                                    function videoFilterLoop() {
                                        var fps = 60;
                                        if(!origVideo.paused && !origVideo.ended) {
                                            //--- Video filter
                                            if(videoFilterMode === "none" || videoFilterLevel === 0) {
                                                context.drawImage(origVideo, 0, 0);
                                            } else {
                                                if(videoFilterMode === "alpha") {
                                                    var alpha = videoFilterLevel * 0.1;
                                                    context.drawImage(origVideo, 0, 0);
                                                    context.fillStyle = 'rgba(0,0,0,' + alpha +')';
                                                    context.fillRect(0, 0, canvasWidth, canvasHeight);
                                                } else if(videoFilterMode === "mosaic") {
                                                    var tileRate = videoFilterLevel * 5;
                                                    var widthTiles = canvasWidth/tileRate;
                                                    var heightTiles = canvasHeight/tileRate;
                                                    var rate = 0.5;
                                                    context.drawImage(origVideo, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth*rate, canvasHeight*rate);
                                                    context.drawImage(canvas, 0, 0, canvasWidth*rate, canvasHeight*rate, 0, 0, widthTiles, heightTiles);
                                                    context.imageSmoothingEnabled = false;
                                                    context.msImageSmoothingEnabled = false;
                                                    context.mozImageSmoothingEnabled = false;
                                                    context.webkitImageSmoothingEnabled = false;
                                                    context.drawImage(canvas, 0, 0, widthTiles, heightTiles, 0, 0, canvasWidth, canvasHeight);
                                                }
                                            }
                                            setTimeout(videoFilterLoop, 1000/fps);
                                        }
                                    }
                                    videoFilterLoop();

                                    //--- Capture the canvas as a local MediaStream
                                    var canvasStream = canvas.captureStream();
                                    if(stream.getVideoTracks().length > 1) {
                                        var preVt = stream.getVideoTracks()[1];
                                        stream.removeTrack(preVt);
                                        try {
                                            preVt.stop();
                                        } catch(e) {}
                                    }
                                    stream.addTrack(canvasStream.getVideoTracks()[0]);

                                    //--- Track sorting(0: Custom, 1: Original)
                                    if(dest !== null) {
                                        pitchChangeEffect = pitchEffect;
                                        dest.stream.addTrack(stream.getAudioTracks()[0]);
                                        for(var i=stream.getVideoTracks().length-1; i >= 0; i--) {
                                            dest.stream.addTrack(stream.getVideoTracks()[i]);
                                        }
                                        stream = dest.stream;
                                    } else {
                                        var tmpStream = new MediaStream();
                                        for(var i=stream.getVideoTracks().length-1; i >= 0; i--) {
                                            tmpStream.addTrack(stream.getVideoTracks()[i]);
                                        }
                                        stream = tmpStream;
                                    }

                                    cHandle.consentDialog(false);
                                    _streamsDone(channelId, jsep, media, callbacks, stream);
                                }, false);
                            }
                        }).catch(function(error) {
                            cHandle.consentDialog(false);
                            callbacks.error({code: error.code, name: error.name, message: error.message});
                        });
                }
            })
            .catch(function(error) {
                cHandle.consentDialog(false);
                callbacks.error(error);
            });
        }
    } else {
        // No need to do a getUserMedia, create offer/answer right away
        _streamsDone(channelId, jsep, media, callbacks);
    }
}

// Note: in the future we may want to change this, e.g., as was
// attempted in https://github.com/meetecho/janus-gateway/issues/1670
var endOfCandidates = null;
function _prepareWebrtcPeer(channelId, callbacks) {
    console.log("_prepareWebrtcPeer");
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : webrtcError;
    callbacks.customizeSdp = (typeof callbacks.customizeSdp == "function") ? callbacks.customizeSdp : noop;
    var jsep = callbacks.jsep;
    var cHandle = channels[channelId];
    if(!cHandle || !cHandle.webrtcStuff) {
        console.warn("Invalid handle");
        callbacks.error("Invalid handle");
        return;
    } 
    var config = cHandle.webrtcStuff;
    if(jsep) {
        if(!config.pc) {
            console.warn("Wait, no PeerConnection?? if this is an answer, use createAnswer and not handleRemoteJsep");
            callbacks.error("No PeerConnection: if this is an answer, use createAnswer and not handleRemoteJsep");
            return;
        }
        callbacks.customizeSdp(jsep);
        config.pc.setRemoteDescription(jsep)
            .then(function() {
                //console.log("Remote description accepted!");
                config.remoteSdp = jsep.sdp;
                // Any trickle candidate we cached?
                if(config.candidates && config.candidates.length > 0) {
                    for(var i = 0; i< config.candidates.length; i++) {
                        var candidate = config.candidates[i];
                        console.debug("Adding remote candidate:", candidate);
                        if(!candidate || candidate.completed === true) {
                            // end-of-candidates
                            config.pc.addIceCandidate(endOfCandidates);
                        } else {
                            // New candidate
                            config.pc.addIceCandidate(candidate);
                        }
                    }
                    config.candidates = [];
                }
                // Done
                callbacks.success();
            }, callbacks.error);
    } else {
        callbacks.error("Invalid JSEP");
    }
}
// WebRTC stuff
function _streamsDone(channelId, jsep, media, callbacks, stream) {
    console.log("_streamsDone");
    var cHandle = channels[channelId];
    if(!cHandle || !cHandle.webrtcStuff) {
        console.warn("Invalid handle");
        // Close all tracks if the given stream has been created internally
        if(!callbacks.stream) {
            stopAllTracks(stream);
        }
        callbacks.error("Invalid handle");
        return;
    } 
    var config = cHandle.webrtcStuff;
    console.debug("_streamsDone:", stream);
    if(stream) {
        console.debug("  -- Audio tracks:", stream.getAudioTracks());
        console.debug("  -- Video tracks:", stream.getVideoTracks());
    }
    // We're now capturing the new stream: check if we're updating or if it's a new thing
    var addTracks = false;
    if(!config.myStream || !media.update || (config.streamExternal && !media.replaceAudio && !media.replaceVideo)) {
        config.myStream = stream;
        addTracks = true;
    } else {
        // We only need to update the existing stream
        if(((!media.update && _isAudioSendEnabled(media)) || (media.update && (media.addAudio || media.replaceAudio))) &&
                stream.getAudioTracks() && stream.getAudioTracks().length) {
            config.myStream.addTrack(stream.getAudioTracks()[0]);
            if(unifiedPlan) {
                // Use Transceivers
                //console.log((media.replaceAudio ? "Replacing" : "Adding") + " audio track:", stream.getAudioTracks()[0]);
                var audioTransceiver = null;
                var transceivers = config.pc.getTransceivers();
                if(transceivers && transceivers.length > 0) {
                    for(var t of transceivers) {
                        if((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
                                (t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
                            audioTransceiver = t;
                            break;
                        }
                    }
                }
                if(audioTransceiver && audioTransceiver.sender) {
                    audioTransceiver.sender.replaceTrack(stream.getAudioTracks()[0]);
                } else {
                    config.pc.addTrack(stream.getAudioTracks()[0], stream);
                }
            } else {
                //console.log((media.replaceAudio ? "Replacing" : "Adding") + " audio track:", stream.getAudioTracks()[0]);
                config.pc.addTrack(stream.getAudioTracks()[0], stream);
            }
        }
        if(((!media.update && _isVideoSendEnabled(media)) || (media.update && (media.addVideo || media.replaceVideo))) &&
                stream.getVideoTracks() && stream.getVideoTracks().length) {
            stream.getVideoTracks().forEach(function(track) {
                config.myStream.addTrack(track);
            });
            if(unifiedPlan) {
                // Use Transceivers
                //console.log((media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTracks()[0]);
                var videoTransceiver = null;
                var transceivers = config.pc.getTransceivers();
                if(transceivers && transceivers.length > 0) {
                    for(var t of transceivers) {
                        if((t.sender && t.sender.track && t.sender.track.kind === "video") ||
                                (t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
                            videoTransceiver = t;
                            break;
                        }
                    }
                }
                if(videoTransceiver && videoTransceiver.sender) {
                    videoTransceiver.sender.replaceTrack(stream.getVideoTracks()[0]);
                } else {
                    config.pc.addTrack(stream.getVideoTracks()[0], stream);
                }
            } else {
                //console.log((media.replaceVideo ? "Replacing" : "Adding") + " video track:", stream.getVideoTracks()[0]);
                config.pc.addTrack(stream.getVideoTracks()[0], stream);
            }
        }
    }
    // If we still need to create a PeerConnection, let's do that
    if(!config.pc) {
        var pc_config = {"iceServers": iceServers, "iceTransportPolicy": iceTransportPolicy, "bundlePolicy": bundlePolicy};
        if(adapter.browserDetails.browser === "chrome") {
            // For Chrome versions before 72, we force a plan-b semantic, and unified-plan otherwise
            pc_config["sdpSemantics"] = (adapter.browserDetails.version < 72) ? "plan-b" : "unified-plan";
        }
        var pc_constraints = {
            "optional": [{"DtlsSrtpKeyAgreement": true}]
        };
        // Check if a sender or receiver transform has been provided
        if(RTCRtpSender && (RTCRtpSender.prototype.createEncodedStreams ||
            (RTCRtpSender.prototype.createEncodedAudioStreams &&
            RTCRtpSender.prototype.createEncodedVideoStreams)) &&
            (callbacks.senderTransforms || callbacks.receiverTransforms)) {
        config.senderTransforms = callbacks.senderTransforms;
        config.receiverTransforms = callbacks.receiverTransforms;
        pc_config["forceEncodedAudioInsertableStreams"] = true;
        pc_config["forceEncodedVideoInsertableStreams"] = true;
        pc_config["encodedInsertableStreams"] = true;
        }
        //console.log("Creating PeerConnection");
        console.debug(pc_constraints);
        config.pc = new RTCPeerConnection(pc_config, pc_constraints);
        console.debug(config.pc);
        if(config.pc.getStats) {	// FIXME
            config.volume = {};
            config.bitrate.value = "0 kbits/sec";
        }
        //console.log("Preparing local SDP and gathering candidates (trickle=" + config.trickle + ")");
        config.pc.oniceconnectionstatechange = function(e) {
            if(config.pc)
                cHandle.iceState(config.pc.iceConnectionState);
        };
        config.pc.onicecandidate = function(event) {
            // JSON.stringify doesn't work on some WebRTC objects anymore
            // See https://code.google.com/p/chromium/issues/detail?id=467366
            //console.log("### event:", event);
            if(event.candidate !== null) {
                var candidate = {
                    "candidate": event.candidate.candidate,
                    "sdpMid": event.candidate.sdpMid,
                    "sdpMLineIndex": event.candidate.sdpMLineIndex
                };
                if(config.trickle === true) {
                    // Send candidate
                    _sendTrickleCandidate(channelId, candidate);
                }
            }
        };
        config.pc.ontrack = function(event) {
            //console.log("Handling Remote Track");
            console.debug(event);
            if(!event.streams)
                return;
            config.remoteStream = event.streams[0];
            cHandle.onremotestream(config.remoteStream);
            if(event.track.onended)
                return;
            if(config.receiverTransforms) {
                var receiverStreams = null;
                if(RTCRtpSender.prototype.createEncodedStreams) {
                    receiverStreams = event.receiver.createEncodedStreams();
                } else if(RTCRtpSender.prototype.createAudioEncodedStreams || RTCRtpSender.prototype.createEncodedVideoStreams) {
                    if(event.track.kind === "audio" && config.receiverTransforms["audio"]) {
                        receiverStreams = event.receiver.createEncodedAudioStreams();
                    } else if(event.track.kind === "video" && config.receiverTransforms["video"]) {
                        receiverStreams = event.receiver.createEncodedVideoStreams();
                    }
                }
                if(receiverStreams) {
                    //console.log(receiverStreams);
                    if(receiverStreams.readableStream && receiverStreams.writableStream) {
                        receiverStreams.readableStream
                            .pipeThrough(config.receiverTransforms[event.track.kind])
                            .pipeTo(receiverStreams.writableStream);
                    } else if(receiverStreams.readable && receiverStreams.writable) {
                        receiverStreams.readable
                            .pipeThrough(config.receiverTransforms[event.track.kind])
                            .pipeTo(receiverStreams.writable);
                    }
                }
            }
            var trackMutedTimeoutId = null;
            //console.log("Adding onended callback to track:", event.track);
            event.track.onended = function(ev) {
                //console.log("Remote track removed:", ev);
                if(config.remoteStream) {
                    clearTimeout(trackMutedTimeoutId);
                    config.remoteStream.removeTrack(ev.target);
                    cHandle.onremotestream(config.remoteStream);
                }
            };
            event.track.onmute = function(ev) {
                //console.log("Remote track muted:", ev);
                if(config.remoteStream && trackMutedTimeoutId == null) {
                    trackMutedTimeoutId = setTimeout(function() {
                        console.log("Removing remote track");
                        if (config.remoteStream) {
                            config.remoteStream.removeTrack(ev.target);
                            cHandle.onremotestream(config.remoteStream);
                        }
                        trackMutedTimeoutId = null;
                    // Chrome seems to raise mute events only at multiples of 834ms;
                    // we set the timeout to three times this value (rounded to 840ms)
                    }, 3 * 840);
                }
            };
            event.track.onunmute = function(ev) {
                //console.log("Remote track flowing again:", ev);
                if(trackMutedTimeoutId != null) {
                    clearTimeout(trackMutedTimeoutId);
                    trackMutedTimeoutId = null;
                } else {
                    try {
                        config.remoteStream.addTrack(ev.target);
                        cHandle.onremotestream(config.remoteStream);
                    } catch(e) {
                        console.error(e);
                    };
                }
            };
        };
    }
    if(addTracks && stream) {
        //console.log('Adding local stream');
        var simulcast2 = (callbacks.simulcast2 === true);
        var audioTracks = stream.getAudioTracks();
        if(audioTracks.length > 0) {
            var at = audioTracks[0];
            _addLocalTrack(stream, at, config, callbacks, simulcast2);
        }
        var videoTracks = stream.getVideoTracks();
        if(videoTracks.length > 0) {
            var vt = videoTracks[0];
            _addLocalTrack(stream, vt, config, callbacks, simulcast2);
        }
    }
    // Any data channel to create?
    if(_isDataEnabled(media) && !config.dataChannel["DataChannel"]) {
        //console.log("Creating default data channel");
        _createDataChannel(channelId, "DataChannel", null, false);
        config.pc.ondatachannel = function(event) {
            //console.log("Data channel created by Janus:", event);
            _createDataChannel(channelId, event.channel.label, event.channel.protocol, event.channel);
        };
    }
    // If there's a new local stream, let's notify the application
    if(config.myStream) {
        cHandle.onlocalstream(config.myStream);
    }
    // Create offer/answer now
    if(!jsep) {
        _createOffer(channelId, media, callbacks);
    } else {
        config.pc.setRemoteDescription(jsep)
            .then(function() {
                //console.log("Remote description accepted!");
                config.remoteSdp = jsep.sdp;
                // Any trickle candidate we cached?
                if(config.candidates && config.candidates.length > 0) {
                    for(var i = 0; i< config.candidates.length; i++) {
                        var candidate = config.candidates[i];
                        console.debug("Adding remote candidate:", candidate);
                        if(!candidate || candidate.completed === true) {
                            // end-of-candidates
                            config.pc.addIceCandidate(endOfCandidates);
                        } else {
                            // New candidate
                            config.pc.addIceCandidate(candidate);
                        }
                    }
                    config.candidates = [];
                }
                // Create the answer now
                _createAnswer(channelId, media, callbacks);
            }, callbacks.error);
    }
}

function _addLocalTrack(stream, track, config, callbacks, simulcast2) {
    console.log("_addLocalTrack");
    //console.log('Adding local track:', track);
    var sender = null;
    if(!simulcast2 || track.kind === 'audio') {
        sender = config.pc.addTrack(track, stream);
    } else {
        //console.log('Enabling rid-based simulcasting:', track);
        var maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
        var tr = config.pc.addTransceiver(track, {
            direction: "sendrecv",
            streams: [stream],
            sendEncodings: callbacks.sendEncodings || [
                { rid: "h", active: true, maxBitrate: maxBitrates.high },
                { rid: "m", active: true, maxBitrate: maxBitrates.medium, scaleResolutionDownBy: 2 },
                { rid: "l", active: true, maxBitrate: maxBitrates.low, scaleResolutionDownBy: 4 }
            ]
        });
        if(tr)
            sender = tr.sender;
    }
    // Check if insertable streams are involved
    if(sender && config.senderTransforms) {
        var senderStreams = null;
        if(RTCRtpSender.prototype.createEncodedStreams) {
            senderStreams = sender.createEncodedStreams();
        } else if(RTCRtpSender.prototype.createAudioEncodedStreams || RTCRtpSender.prototype.createEncodedVideoStreams) {
            if(sender.track.kind === "audio" && config.senderTransforms["audio"]) {
                senderStreams = sender.createEncodedAudioStreams();
            } else if(sender.track.kind === "video" && config.senderTransforms["video"]) {
                senderStreams = sender.createEncodedVideoStreams();
            }
        }
        if(senderStreams) {
            //console.log(senderStreams);
            if(senderStreams.readableStream && senderStreams.writableStream) {
                senderStreams.readableStream
                    .pipeThrough(config.senderTransforms[sender.track.kind])
                    .pipeTo(senderStreams.writableStream);
            } else if(senderStreams.readable && senderStreams.writable) {
                senderStreams.readable
                    .pipeThrough(config.senderTransforms[sender.track.kind])
                    .pipeTo(senderStreams.writable);
            }
        }
    }
}

// Private method to create a data channel
function _createDataChannel(channelId, dclabel, dcprotocol, incoming, pendingData) {
    console.log("_createDataChannel");
    var cHandle = channels[channelId];
    if(!cHandle || !cHandle.webrtcStuff) {
        console.warn("Invalid handle");
        return;
    }
    var config = cHandle.webrtcStuff;
    if(!config.pc) {
        console.warn("Invalid PeerConnection");
        return;
    }
    var onDataChannelMessage = function(event) {
        //console.log('Received message on data channel:', event);
        var label = event.target.label;
        cHandle.ondata(event.data, label);
    };
    var onDataChannelStateChange = function(event) {
        //console.log('Received state change on data channel:', event);
        var label = event.target.label;
        var protocol = event.target.protocol;
        var dcState = config.dataChannel[label] ? config.dataChannel[label].readyState : "null";
        //console.log('State change on <' + label + '> data channel: ' + dcState);
        if(dcState === 'open') {
            // Any pending messages to send?
            if(config.dataChannel[label].pending && config.dataChannel[label].pending.length > 0) {
                //console.log("Sending pending messages on <" + label + ">:", config.dataChannel[label].pending.length);
                for(var data of config.dataChannel[label].pending) {
                    //console.log("Sending data on data channel <" + label + ">");
                    console.debug(data);
                    config.dataChannel[label].send(data);
                }
                config.dataChannel[label].pending = [];
            }
            // Notify the open data channel
            cHandle.ondataopen(label, protocol);
        }
    };
    var onDataChannelError = function(error) {
        console.error('Got error on data channel:', error);
        // TODO
    };
    if(!incoming) {
        // FIXME Add options (ordered, maxRetransmits, etc.)
        var dcoptions = { ordered: true };
        if(dcprotocol)
            dcoptions.protocol = dcprotocol;
        config.dataChannel[dclabel] = config.pc.createDataChannel(dclabel, dcoptions);
    } else {
        // The channel was created by J.
        config.dataChannel[dclabel] = incoming;
    }
    config.dataChannel[dclabel].onmessage = onDataChannelMessage;
    config.dataChannel[dclabel].onopen = onDataChannelStateChange;
    config.dataChannel[dclabel].onclose = onDataChannelStateChange;
    config.dataChannel[dclabel].onerror = onDataChannelError;
    config.dataChannel[dclabel].pending = [];
    if(pendingData)
        config.dataChannel[dclabel].pending.push(pendingData);
}

function _createOffer(channelId, media, callbacks) {
    console.log("_createOffer");
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : noop;
    callbacks.customizeSdp = (typeof callbacks.customizeSdp == "function") ? callbacks.customizeSdp : noop;
    var cHandle = channels[channelId];
    if(!cHandle || !cHandle.webrtcStuff) {
        console.warn("Invalid handle");
        callbacks.error("Invalid handle");
        return;
    }
    var config = cHandle.webrtcStuff;
    var simulcast = (callbacks.simulcast === true);
    if(!simulcast) {
        //console.log("Creating offer (iceDone=" + config.iceDone + ")");
    } else {
        //console.log("Creating offer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
    }
    // https://code.google.com/p/webrtc/issues/detail?id=3508
    var mediaConstraints = {};
    if(unifiedPlan) {
        // We can use Transceivers
        var audioTransceiver = null, videoTransceiver = null;
        var transceivers = config.pc.getTransceivers();
        if(transceivers && transceivers.length > 0) {
            for(var t of transceivers) {
                if((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
                        (t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
                    if(!audioTransceiver) {
                        audioTransceiver = t;
                    }
                    continue;
                }
                if((t.sender && t.sender.track && t.sender.track.kind === "video") ||
                        (t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
                    if(!videoTransceiver) {
                        videoTransceiver = t;
                    }
                    continue;
                }
            }
        }
        // Handle audio (and related changes, if any)
        var audioSend = _isAudioSendEnabled(media);
        var audioRecv = _isAudioRecvEnabled(media);
        if(!audioSend && !audioRecv) {
            // Audio disabled: have we removed it?
            if(media.removeAudio && audioTransceiver) {
                if (audioTransceiver.setDirection) {
                    audioTransceiver.setDirection("inactive");
                } else {
                    audioTransceiver.direction = "inactive";
                }
                //console.log("Setting audio transceiver to inactive:", audioTransceiver);
            }
        } else {
            // Take care of audio m-line
            if(audioSend && audioRecv) {
                if(audioTransceiver) {
                    if (audioTransceiver.setDirection) {
                        audioTransceiver.setDirection("sendrecv");
                    } else {
                        audioTransceiver.direction = "sendrecv";
                    }
                    //console.log("Setting audio transceiver to sendrecv:", audioTransceiver);
                }
            } else if(audioSend && !audioRecv) {
                if(audioTransceiver) {
                    if (audioTransceiver.setDirection) {
                        audioTransceiver.setDirection("sendonly");
                    } else {
                        audioTransceiver.direction = "sendonly";
                    }
                    //console.log("Setting audio transceiver to sendonly:", audioTransceiver);
                }
            } else if(!audioSend && audioRecv) {
                if(audioTransceiver) {
                    if (audioTransceiver.setDirection) {
                        audioTransceiver.setDirection("recvonly");
                    } else {
                        audioTransceiver.direction = "recvonly";
                    }
                    //console.log("Setting audio transceiver to recvonly:", audioTransceiver);
                } else {
                    // In theory, this is the only case where we might not have a transceiver yet
                    audioTransceiver = config.pc.addTransceiver("audio", { direction: "recvonly" });
                    //console.log("Adding recvonly audio transceiver:", audioTransceiver);
                }
            }
        }
        // Handle video (and related changes, if any)
        var videoSend = _isVideoSendEnabled(media);
        var videoRecv = _isVideoRecvEnabled(media);
        if(!videoSend && !videoRecv) {
            // Video disabled: have we removed it?
            if(media.removeVideo && videoTransceiver) {
                if (videoTransceiver.setDirection) {
                    videoTransceiver.setDirection("inactive");
                } else {
                    videoTransceiver.direction = "inactive";
                }
                //console.log("Setting video transceiver to inactive:", videoTransceiver);
            }
        } else {
            // Take care of video m-line
            if(videoSend && videoRecv) {
                if(videoTransceiver) {
                    if (videoTransceiver.setDirection) {
                        videoTransceiver.setDirection("sendrecv");
                    } else {
                        videoTransceiver.direction = "sendrecv";
                    }
                    //console.log("Setting video transceiver to sendrecv:", videoTransceiver);
                }
            } else if(videoSend && !videoRecv) {
                if(videoTransceiver) {
                    if (videoTransceiver.setDirection) {
                        videoTransceiver.setDirection("sendonly");
                    } else {
                        videoTransceiver.direction = "sendonly";
                    }
                    //console.log("Setting video transceiver to sendonly:", videoTransceiver);
                }
            } else if(!videoSend && videoRecv) {
                if(videoTransceiver) {
                    if (videoTransceiver.setDirection) {
                        videoTransceiver.setDirection("recvonly");
                    } else {
                        videoTransceiver.direction = "recvonly";
                    }
                    //console.log("Setting video transceiver to recvonly:", videoTransceiver);
                } else {
                    // In theory, this is the only case where we might not have a transceiver yet
                    videoTransceiver = config.pc.addTransceiver("video", { direction: "recvonly" });
                    //console.log("Adding recvonly video transceiver:", videoTransceiver);
                }
            }
        }
    } else {
        mediaConstraints["offerToReceiveAudio"] = _isAudioRecvEnabled(media);
        mediaConstraints["offerToReceiveVideo"] = _isVideoRecvEnabled(media);
    }
    var iceRestart = (callbacks.iceRestart === true);
    if(iceRestart) {
        mediaConstraints["iceRestart"] = true;
    }
    console.debug(mediaConstraints);
    // Check if this is Firefox and we've been asked to do simulcasting
    var sendVideo = _isVideoSendEnabled(media);
    if(sendVideo && simulcast && adapter.browserDetails.browser === "firefox") {
        // FIXME Based on https://gist.github.com/voluntas/088bc3cc62094730647b
        //console.log("Enabling Simulcasting for Firefox (RID)");
        var sender = config.pc.getSenders().find(function(s) {return s.track && s.track.kind === "video"});
        if(sender) {
            var parameters = sender.getParameters();
            if(!parameters) {
                parameters = {};
            }
            var maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
            parameters.encodings = callbacks.sendEncodings || [
                { rid: "h", active: true, maxBitrate: maxBitrates.high },
                { rid: "m", active: true, maxBitrate: maxBitrates.medium, scaleResolutionDownBy: 2 },
                { rid: "l", active: true, maxBitrate: maxBitrates.low, scaleResolutionDownBy: 4 }
            ];
            sender.setParameters(parameters);
        }
    }
    config.pc.createOffer(mediaConstraints)
        .then(function(offer) {
            console.debug(offer);
            // JSON.stringify doesn't work on some WebRTC objects anymore
            // See https://code.google.com/p/chromium/issues/detail?id=467366
            var jsep = {
                "type": offer.type,
                "sdp": offer.sdp
            };
            callbacks.customizeSdp(jsep);
            offer.sdp = jsep.sdp;
            //console.log("Setting local description");
            if(sendVideo && simulcast) {
                // This SDP munging only works with Chrome (Safari STP may support it too)
                if(adapter.browserDetails.browser === "chrome" ||
                adapter.browserDetails.browser === "safari") {
                            //console.log("Enabling Simulcasting for Chrome (SDP munging)");
                    offer.sdp = mungeSdpForSimulcasting(offer.sdp);
                } else if(adapter.browserDetails.browser !== "firefox") {
                    console.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
                }
            }
            config.mySdp = {
                type: "offer",
                sdp: offer.sdp
            };
            config.pc.setLocalDescription(offer) //*****
                .catch(callbacks.error);
            config.mediaConstraints = mediaConstraints;
            if(!config.iceDone && !config.trickle) {
                // Don't do anything until we have all candidates
                //console.log("Waiting for all candidates...");
                return;
            }
            // If transforms are present, notify Janus that the media is end-to-end encrypted
            if(config.senderTransforms || config.receiverTransforms) {
                offer["e2ee"] = true;
            }
            callbacks.success(offer);
        }, callbacks.error);
}

function _createAnswer(channelId, media, callbacks) {
    console.log("_createAnswer");
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : noop;
    callbacks.customizeSdp = (typeof callbacks.customizeSdp == "function") ? callbacks.customizeSdp : noop;
    var cHandle = channels[channelId];
    if(!cHandle || !cHandle.webrtcStuff) {
        console.warn("Invalid handle");
        callbacks.error("Invalid handle");
        return;
    } 
    var config = cHandle.webrtcStuff;
    var simulcast = (callbacks.simulcast === true);
    if(!simulcast) {
        //console.log("Creating answer (iceDone=" + config.iceDone + ")");
    } else {
        //console.log("Creating answer (iceDone=" + config.iceDone + ", simulcast=" + simulcast + ")");
    }
    var mediaConstraints = null;
    if(unifiedPlan) {
        // We can use Transceivers
        mediaConstraints = {};
        var audioTransceiver = null, videoTransceiver = null;
        var transceivers = config.pc.getTransceivers();
        if(transceivers && transceivers.length > 0) {
            for(var t of transceivers) {
                if((t.sender && t.sender.track && t.sender.track.kind === "audio") ||
                        (t.receiver && t.receiver.track && t.receiver.track.kind === "audio")) {
                    if(!audioTransceiver)
                        audioTransceiver = t;
                    continue;
                }
                if((t.sender && t.sender.track && t.sender.track.kind === "video") ||
                        (t.receiver && t.receiver.track && t.receiver.track.kind === "video")) {
                    if(!videoTransceiver)
                        videoTransceiver = t;
                    continue;
                }
            }
        }
        // Handle audio (and related changes, if any)
        var audioSend = _isAudioSendEnabled(media);
        var audioRecv = _isAudioRecvEnabled(media);
        if(!audioSend && !audioRecv) {
            // Audio disabled: have we removed it?
            if(media.removeAudio && audioTransceiver) {
                try {
                    if (audioTransceiver.setDirection) {
                        audioTransceiver.setDirection("inactive");
                    } else {
                        audioTransceiver.direction = "inactive";
                    }
                    //console.log("Setting audio transceiver to inactive:", audioTransceiver);
                } catch(e) {
                    console.error(e);
                }
            }
        } else {
            // Take care of audio m-line
            if(audioSend && audioRecv) {
                if(audioTransceiver) {
                    try {
                        if (audioTransceiver.setDirection) {
                            audioTransceiver.setDirection("sendrecv");
                        } else {
                            audioTransceiver.direction = "sendrecv";
                        }
                        //console.log("Setting audio transceiver to sendrecv:", audioTransceiver);
                    } catch(e) {
                        console.error(e);
                    }
                }
            } else if(audioSend && !audioRecv) {
                try {
                    if(audioTransceiver) {
                        if (audioTransceiver.setDirection) {
                            audioTransceiver.setDirection("sendonly");
                        } else {
                            audioTransceiver.direction = "sendonly";
                        }
                        //console.log("Setting audio transceiver to sendonly:", audioTransceiver);
                    }
                } catch(e) {
                    console.error(e);
                }
            } else if(!audioSend && audioRecv) {
                if(audioTransceiver) {
                    try {
                        if (audioTransceiver.setDirection) {
                            audioTransceiver.setDirection("recvonly");
                        } else {
                            audioTransceiver.direction = "recvonly";
                        }
                        //console.log("Setting audio transceiver to recvonly:", audioTransceiver);
                    } catch(e) {
                        console.error(e);
                    }
                } else {
                    // In theory, this is the only case where we might not have a transceiver yet
                    audioTransceiver = config.pc.addTransceiver("audio", { direction: "recvonly" });
                    //console.log("Adding recvonly audio transceiver:", audioTransceiver);
                }
            }
        }
        // Handle video (and related changes, if any)
        var videoSend = _isVideoSendEnabled(media);
        var videoRecv = _isVideoRecvEnabled(media);
        if(!videoSend && !videoRecv) {
            // Video disabled: have we removed it?
            if(media.removeVideo && videoTransceiver) {
                try {
                    if (videoTransceiver.setDirection) {
                        videoTransceiver.setDirection("inactive");
                    } else {
                        videoTransceiver.direction = "inactive";
                    }
                    //console.log("Setting video transceiver to inactive:", videoTransceiver);
                } catch(e) {
                    console.error(e);
                }
            }
        } else {
            // Take care of video m-line
            if(videoSend && videoRecv) {
                if(videoTransceiver) {
                    try {
                        if (videoTransceiver.setDirection) {
                            videoTransceiver.setDirection("sendrecv");
                        } else {
                            videoTransceiver.direction = "sendrecv";
                        }
                        //console.log("Setting video transceiver to sendrecv:", videoTransceiver);
                    } catch(e) {
                        console.error(e);
                    }
                }
            } else if(videoSend && !videoRecv) {
                if(videoTransceiver) {
                    try {
                        if (videoTransceiver.setDirection) {
                            videoTransceiver.setDirection("sendonly");
                        } else {
                            videoTransceiver.direction = "sendonly";
                        }
                        //console.log("Setting video transceiver to sendonly:", videoTransceiver);
                    } catch(e) {
                        console.error(e);
                    }
                }
            } else if(!videoSend && videoRecv) {
                if(videoTransceiver) {
                    try {
                        if (videoTransceiver.setDirection) {
                            videoTransceiver.setDirection("recvonly");
                        } else {
                            videoTransceiver.direction = "recvonly";
                        }
                        //console.log("Setting video transceiver to recvonly:", videoTransceiver);
                    } catch(e) {
                        console.error(e);
                    }
                } else {
                    // In theory, this is the only case where we might not have a transceiver yet
                    videoTransceiver = config.pc.addTransceiver("video", { direction: "recvonly" });
                    //console.log("Adding recvonly video transceiver:", videoTransceiver);
                }
            }
        }
    } else {
        if(adapter.browserDetails.browser === "firefox" || adapter.browserDetails.browser === "edge") {
        	mediaConstraints = {
        		offerToReceiveAudio: _isAudioRecvEnabled(media),
        		offerToReceiveVideo: _isVideoRecvEnabled(media)
        	};
        } else {
        	mediaConstraints = {
        		mandatory: {
        			OfferToReceiveAudio: _isAudioRecvEnabled(media),
        			OfferToReceiveVideo: _isVideoRecvEnabled(media)
        		}
        	};
        }
    }
    console.debug(mediaConstraints);
    // Check if this is Firefox and we've been asked to do simulcasting
    var sendVideo = _isVideoSendEnabled(media);
    if(sendVideo && simulcast && adapter.browserDetails.browser === "firefox") {
    	// FIXME Based on https://gist.github.com/voluntas/088bc3cc62094730647b
    	//console.log("Enabling Simulcasting for Firefox (RID)");
    	var sender = config.pc.getSenders()[1];
    	//console.log(sender);
    	var parameters = sender.getParameters();
    	//console.log(parameters);

    	var maxBitrates = getMaxBitrates(callbacks.simulcastMaxBitrates);
    	sender.setParameters({encodings: callbacks.sendEncodings || [
    		{ rid: "h", active: true, maxBitrate: maxBitrates.high },
    		{ rid: "m", active: true, maxBitrate: maxBitrates.medium, scaleResolutionDownBy: 2},
    		{ rid: "l", active: true, maxBitrate: maxBitrates.low, scaleResolutionDownBy: 4}
    	]});
    }
    config.pc.createAnswer(mediaConstraints)
        .then(function(answer) {
            console.debug(answer);
            // JSON.stringify doesn't work on some WebRTC objects anymore
            // See https://code.google.com/p/chromium/issues/detail?id=467366
            var jsep = {
                "type": answer.type,
                "sdp": answer.sdp
            };
            callbacks.customizeSdp(jsep);
            answer.sdp = jsep.sdp;
            //console.log("Setting local description");
            if(sendVideo && simulcast) {
            	// This SDP munging only works with Chrome
            	if(adapter.browserDetails.browser === "chrome") {
            		// FIXME Apparently trying to simulcast when answering breaks video in Chrome...
            		//~ Janus.log("Enabling Simulcasting for Chrome (SDP munging)");
            		//~ answer.sdp = mungeSdpForSimulcasting(answer.sdp);
            		console.warn("simulcast=true, but this is an answer, and video breaks in Chrome if we enable it");
            	} else if(adapter.browserDetails.browser !== "firefox") {
            		console.warn("simulcast=true, but this is not Chrome nor Firefox, ignoring");
            	}
            }
            config.mySdp = answer.sdp;
            config.pc.setLocalDescription(answer)
                .catch(callbacks.error);
            config.mediaConstraints = mediaConstraints;
            if(!config.iceDone && !config.trickle) {
                // Don't do anything until we have all candidates
                //console.log("Waiting for all candidates...");
                return;
            }
            // If transforms are present, notify Janus that the media is end-to-end encrypted
            if(config.senderTransforms || config.receiverTransforms) {
                answer["e2ee"] = true;
            }
            callbacks.success(answer);
        }, callbacks.error);
}

function getBitrate(channelId) {
    console.log("getBitrate");
    var cHandle = channels[channelId];
    if(!cHandle || !cHandle.webrtcStuff) {
        console.warn("Invalid handle");
        return;
    } 
    var config = cHandle.webrtcStuff;
    if(!config.pc)
        return "Invalid PeerConnection";
    // Start getting the bitrate, if getStats is supported
    if(config.pc.getStats) {
        if(!config.bitrate.timer) {
            //console.log("Starting bitrate timer (via getStats)");
            config.bitrate.timer = setInterval(function() {
                config.pc.getStats()
                    .then(function(stats) {
                        stats.forEach(function (res) {
                            if(!res)
                                return;
                            var inStats = false;
                            // Check if these are statistics on incoming media
                            if((res.mediaType === "video" || res.id.toLowerCase().indexOf("video") > -1) &&
                                    res.type === "inbound-rtp" && res.id.indexOf("rtcp") < 0) {
                                // New stats
                                inStats = true;
                            } else if(res.type == 'ssrc' && res.bytesReceived &&
                                    (res.googCodecName === "VP8" || res.googCodecName === "")) {
                                // Older Chromer versions
                                inStats = true;
                            }
                            // Parse stats now
                            if(inStats) {
                                config.bitrate.bsnow = res.bytesReceived;
                                config.bitrate.tsnow = res.timestamp;
                                if(config.bitrate.bsbefore === null || config.bitrate.tsbefore === null) {
                                    // Skip this round
                                    config.bitrate.bsbefore = config.bitrate.bsnow;
                                    config.bitrate.tsbefore = config.bitrate.tsnow;
                                } else {
                                    // Calculate bitrate
                                    var timePassed = config.bitrate.tsnow - config.bitrate.tsbefore;
                                    if(adapter.browserDetails.browser === "safari")
                                        timePassed = timePassed/1000;	// Apparently the timestamp is in microseconds, in Safari
                                    var bitRate = Math.round((config.bitrate.bsnow - config.bitrate.bsbefore) * 8 / timePassed);
                                    if(adapter.browserDetails.browser === "safari")
                                        bitRate = parseInt(bitRate/1000);
                                    config.bitrate.value = bitRate + ' kbits/sec';
                                    //~ console.log("Estimated bitrate is " + config.bitrate.value);
                                    config.bitrate.bsbefore = config.bitrate.bsnow;
                                    config.bitrate.tsbefore = config.bitrate.tsnow;
                                }
                            }
                        });
                    });
            }, 1000);
            return "0 kbits/sec";	// We don't have a bitrate value yet
        }
        return config.bitrate.value;
    } else {
        console.warn("Getting the video bitrate unsupported by browser");
        return "Feature unsupported by browser";
    }
}

function webrtcError(error) {
    console.log("webrtcError");
    console.error("WebRTC error:", error);
}

function _cleanupWebrtc(channelId) {
    console.log("_cleanupWebrtc");
    //console.log("Cleaning WebRTC stuff");
    var cHandle = channels[channelId];
    if(!cHandle) {
        // Nothing to clean
        return;
    } 
    var config = cHandle.webrtcStuff;
    if(config) {
        // Cleanup stack
        config.remoteStream = null;
        if(config.volume) {
            if(config.volume["local"] && config.volume["local"].timer)
                clearInterval(config.volume["local"].timer);
            if(config.volume["remote"] && config.volume["remote"].timer)
                clearInterval(config.volume["remote"].timer);
        }
        config.volume = {};
        if(config.bitrate.timer)
            clearInterval(config.bitrate.timer);
        config.bitrate.timer = null;
        config.bitrate.bsnow = null;
        config.bitrate.bsbefore = null;
        config.bitrate.tsnow = null;
        config.bitrate.tsbefore = null;
        config.bitrate.value = null;
        if(!config.streamExternal && config.myStream) {
            //console.log("Stopping local stream tracks");
            stopAllTracks(config.myStream);
        }
        config.streamExternal = false;
        config.myStream = null;
        // Close PeerConnection
        try {
            config.pc.close();
        } catch(e) {
            // Do nothing
        }
        config.pc = null;
        config.candidates = null;
        config.mySdp = null;
        config.remoteSdp = null;
        config.iceDone = false;
        config.dataChannel = {};
        config.dtmfSender = null;
        config.senderTransforms = null;
        config.receiverTransforms = null;
    }
    cHandle.oncleanup();
}

function _destroyHandle(channelId, callbacks) {
    console.log("_destroyHandle");
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : noop;
    var noRequest = (callbacks.noRequest === true);
    //console.log("Destroying handle " + channelId + " (only-locally=" + noRequest + ")");
    _cleanupWebrtc(channelId);
    var cHandle = channels[channelId];
    if(!cHandle || cHandle.detached) {
        // Plugin was already detached by Janus, calling detach again will return a handle not found error, so just exit here
        delete channels[channelId];
        callbacks.success();
        return;
    }
    if(noRequest) {
        // We're only removing the handle locally
        delete channels[channelId];
        callbacks.success();
        return;
    }
    if(!connected) {
        console.warn("Is the server down? (connected=false)");
        callbacks.error("Is the server down? (connected=false)");
        return;
    }
}

function unsubscribe(channelId) {
    console.log("unsubscribe");
    var data = { cid: channelId };
    var request = { data };
    httpAPICall("/onsvc/videoconf/unsubscribe", {
        verb: 'POST',
        // withCredentials: withCredentials,
        body: request,
        success: function(json) {
            //console.log("Destroyed handle:");
            console.debug(json);
            delete channels[channelId];
        },
        error: function(textStatus, errorThrown) {
            console.error(textStatus + ":", errorThrown);
            // We cleanup anyway
            delete channels[channelId];
        }
    });
}

function stopAllTracks(stream) {
    console.log("stopAllTracks");
	try {
		// Try a MediaStreamTrack.stop() for each track
		var tracks = stream.getTracks();
		for(var mst of tracks) {
			//console.log("##### [stopAllTracks()]", mst);
			if(mst) {
				mst.stop();
			}
		}
	} catch(e) {
		// Do nothing if this fails
	}
}

function attachMediaStream(element, stream) {
    console.log("attachMediaStream");
    try {
        element.srcObject = stream;
    } catch (e) {
        try {
            element.src = URL.createObjectURL(stream);
        } catch (e) {
            console.error("Error attaching stream to element");
        }
    }
};

function reattachMediaStream(to, from) {
    console.log("reattachMediaStream");
    try {
        to.srcObject = from.srcObject;
    } catch (e) {
        try {
            to.src = from.src;
        } catch (e) {
            console.error("Error reattaching stream to element");
        }
    }
};

//--- For videoRoom
function publishOwnFeed(useAudio) {
    console.log("publishOwnFeed");
	// Publish our stream
	sfutest.createOffer(
		{
			media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true, video: defaultResoltion },	// Publishers are sendonly
			success: function(jsep) {
				console.debug("Got publisher SDP!", jsep);
                var data = { request: 'configure', cid: sfutest.getId(), jsep: jsep, audio: useAudio, video: true };
                var request = { data };
                httpAPICall("/onsvc/videoconf/publish", {
                    verb: 'POST',
                    body: request,
                    success: function(json) {
                        console.debug("Publish own feed success!", json);
                    },
                    error: function(textStatus, errorThrown) {
                        if(errorThrown === "")
                            bootbox.alert(textStatus + ": Is the server down?");
                        else {
                            bootbox.alert(textStatus + ": " + errorThrown);
                        }
                    }
                });
                changeBitrate("1024");
			},
			error: function(error) {
				console.error("WebRTC error:", error);
				if(useAudio) {
					 publishOwnFeed(false);
				} else {
					bootbox.alert("WebRTC error... " + error.message);
				}
			}
		});
}

function localFeedForVideoCall(isCaller) {
    console.log("localFeedForVideoCall");
    var data = { userid: calleeId };
    var body = { data };
    _createChannelHandler("/onsvc/videocall/init", body, {
            success: function(cHandle) {
                videocall = cHandle;
                //console.log("Plugin attached! (ChannelId=" + videocall.getId() + ")");
                // Call this user
                if(isCaller) {
                    cHandle.createOffer(
                        {
                            // By default, it's sendrecv for audio and video...
                            media: { data: true, video: defaultResoltion },  // ... let's negotiate data channels as well
                            success: function(jsep) {
                                console.debug("Got SDP!", jsep);
                                var data = { jsep: jsep };
                                var request = { data: data };
                                httpAPICall("/onsvc/videocall/call", {
                                    verb: 'POST',
                                    body: request,
                                    success: function(json) {
                                        console.debug(json);
                                    },
                                    error: function(textStatus, errorThrown) {
                                        if(errorThrown === "")
                                            bootbox.alert(textStatus + ": Is the server down?");
                                        else {
                                            bootbox.alert(textStatus + ": " + errorThrown);
                                        }
                                        calleeId = null;
                                        calleeName = null;
                                    }
                                });
                            },
                            error: function(error) {
                                console.error("WebRTC error...", error);
                                bootbox.alert("WebRTC error... " + error.message);
                                calleeId = null;
                                calleeName = null;
                            }
                        });
                }                
            },
            error: function(error) {
                if(error === "Callee is busy") {
                    bootbox.alert("상대방이 이미 통화중입니다");
                } else {
                    console.error("  -- Error attaching plugin...", error);
                    bootbox.alert("  -- Error attaching plugin... " + error);
                }
                afterVideoCallEnd();
            },
            consentDialog: function(on) {
                console.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
                if(on) {
                    $.blockUI({
                        message: '<p class="text-center mb-0"><i class="fa fa-spin fa-cog"></i> 잠시만 기다려주세요...</p>'
                    });
                } else {
                    $.unblockUI();
                }
            },
            iceState: function(state) {
                //console.log("ICE state changed to " + state);
            },
            mediaState: function(medium, on) {
                //console.log("WebRTC server " + (on ? "started" : "stopped") + " receiving our " + medium);
            },
            webrtcState: function(on) {
                //console.log("WebRTC server says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                if(on) {
                    $("#videolocal").parent().unblock();
                    changeBitrate("1024");
                }
            },
            onmessage: function(msg, jsep) {
                console.debug(" ::: Got a message :::", msg);
                var event = msg["event_type"];
                console.debug("Event: " + event);
                if(event) {
                    if(event === 'list') {
                        var list = result["list"];
                        console.debug("Got a list of registered peers:", list);
                        for(var mp in list) {
                            console.debug("  >> [" + list[mp] + "]");
                        }
                    } else if(event === 'calling') {
                        //console.log("Waiting for the peer to answer...");
                        bootbox.alert("상대방의 응답을 기다리는 중입니다...");
                        ringingSound.play();
                        afterVideoCallStart();
                    } else if(event === 'failure') {
                        //console.log("VidelCall failure... " + msg["reason"]);
                        // Reset status
                        bootbox.hideAll();
                        videocall.detach();
                        if(spinner)
                            spinner.stop();
                        $('#waitingvideo').remove();
                        $('#videos').hide();
                        $('#curbitrate').hide();
                        $('#curres').hide();
                        $('roomcontainer').hide();
                        ringingSound.load();
                        afterVideoCallEnd();

                        bootbox.alert("상대방과의 연결에 실패했습니다. 잠시 후 다시 시도해주시기 바랍니다.");
                    } else if(event === 'incomingcall') {
                        //console.log("Incoming call from " + msg["caller_id"] + "!");

                        //--- Get Caller Name
                        calleeId = msg["caller_id"];
                        var callerName = msg["caller_name"];
                        setUserName(); //--- Set calleeName
                        if(calleeName === null) {
                            calleeName = callerName;
                        }
                        //---

                        // Notify user
                        bootbox.hideAll();
                        ringingSound.play();
                        incoming = bootbox.dialog({
                            message: "'" + calleeName + "'님으로부터 영상통화 요청을 받았습니다!",
                            title: "영상통화 요청 수신",
                            closeButton: false,
                            buttons: {
                                success: {
                                    label: "수락",
                                    className: "btn-success",
                                    callback: function() {
                                        ringingSound.load();
                                        incoming = null;
                                        $('#peer').val(msg["caller_id"]).attr('disabled', true);
                                        afterVideoCallStart();
                                        addCallerLayout();
                                        addCalleeLayout();
                                        videocall.createAnswer(
                                            {
                                                jsep: jsep,
                                                // No media provided: by default, it's sendrecv for audio and video
                                                media: { data: true, video: defaultResoltion },	// Let's negotiate data channels as well
                                                success: function(jsep) {
                                                    console.debug("Got SDP!", jsep);
                                                    var data = { request: 'accept', jsep: jsep, cid: videocall.getId() };
                                                    var request = { data };
                                                    httpAPICall("/onsvc/videocall/accept", {
                                                        verb: 'POST',
                                                        body: request,
                                                        success: function(json) {
                                                            console.debug(json);
                                                        },
                                                        error: function(textStatus, errorThrown) {
                                                            if(errorThrown === "")
                                                                bootbox.alert(textStatus + ": Is the server down?");
                                                            else {
                                                                bootbox.alert(textStatus + ": " + errorThrown);
                                                            }
                                                        }
                                                    });

                                                },
                                                error: function(error) {
                                                    console.error("WebRTC error:", error);
                                                    bootbox.alert("WebRTC error... " + error.message);
                                                }
                                            });
                                    }
                                },
                                danger: {
                                    label: "거절",
                                    className: "btn-danger",
                                    callback: function() {
                                        ringingSound.load();
                                        doHangup();
                                    }
                                }
                            }
                        });
                    } else if(event === 'accepted') {
                        bootbox.hideAll();
                        var peer = msg["id"];
                        if(!peer) {
                            //console.log("Call started!");
                        } else {
                            //console.log(peer + " accepted the call!");
                            ringingSound.load();
                            addCalleeLayout();
                        }
                        // Video call can start
                        if(jsep)
                            videocall.handleRemoteJsep({ jsep: jsep });
                    } else if(event === 'update') {
                        // An 'update' event may be used to provide renegotiation attempts
                        if(jsep) {
                            if(jsep.type === "answer") {
                                videocall.handleRemoteJsep({ jsep: jsep });
                            } else {
                                videocall.createAnswer(
                                    {
                                        jsep: jsep,
                                        media: { data: true },	// Let's negotiate data channels as well
                                        success: function(jsep) {
                                            console.debug("Got SDP!", jsep);
                                            var body = { request: "set" };
                                            videocall.send({ message: body, jsep: jsep });
                                        },
                                        error: function(error) {
                                            console.error("WebRTC error:", error);
                                            bootbox.alert("WebRTC error... " + error.message);
                                        }
                                    });
                            }
                        }
                    } else if(event === 'hangup') {
                        //console.log("Call hung up by " + msg["id"] + " (" + msg["reason"] + ")!");
                        // Reset status
                        bootbox.hideAll();
                        videocall.detach();
                        if(spinner)
                            spinner.stop();
                        $('#waitingvideo').remove();
                        $('#videos').hide();
                        $('#curbitrate').hide();
                        $('#curres').hide();

                        ringingSound.load();
                        afterVideoCallEnd();

                        if(msg["reason"] === "Rejected") {
                            bootbox.alert("요청이 거절됐습니다.");
                        } else if(msg["reason"] === "Canceled") {
                            bootbox.alert("수신 요청이 발신자에 의해 취소됐습니다.");
                        }
                    } else if(event === "simulcast") {
                        // Is simulcast in place?
                        var substream = result["substream"];
                        var temporal = result["temporal"];
                        if((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
                            if(!simulcastStarted) {
                                simulcastStarted = true;
                                addSimulcastButtons(result["videocodec"] === "vp8" || result["videocodec"] === "h264");
                            }
                            // We just received notice that there's been a switch, update the buttons
                            updateSimulcastButtons(substream, temporal);
                        }
                    }
                } else {
                    videocall.hangup();
                    if(spinner)
                        spinner.stop();
                    unAfterGetStreamEvent();
                    $('#waitingvideo').remove();
                    $('#videos').hide();
                    $('#curbitrate').hide();
                    $('#curres').hide();
                    if(bitrateTimer[1])
                        clearInterval(bitrateTimer[1]);
                    bitrateTimer[1] = null;
                }
            },
            onlocalstream: function(stream) {
                console.debug(" ::: Got a local stream :::", stream);
                resizeMultiVideo();
                afterGetStreamEvent();
                $('#videolocal').append('<video class="rounded centered" id="myvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>');
                attachMediaStream($('#myvideo').get(0), stream);
                $("#myvideo").get(0).muted = "muted";
                if(videocall.webrtcStuff.pc.iceConnectionState !== "completed" &&
                        videocall.webrtcStuff.pc.iceConnectionState !== "connected") {
                    $("#videolocal").parent().block({
                        message: '<b>Publishing...</b>',
                        css: {
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: 'white'
                        }
                    });
                    // No remote video yet
                    $('#videoremote').append('<video class="rounded centered" id="waitingvideo" width="100%" height="100%" />');
                    if(spinner == null) {
                        var target = document.getElementById('videoremote');
                        spinner = new Spinner({top:100}).spin(target);
                    } else {
                        spinner.spin();
                    }
                }
                var videoTracks = stream.getVideoTracks();
                if(!videoTracks || videoTracks.length === 0) {
                    // No webcam
                    $('#myvideo').hide();
                    if($('#videolocal .no-video-container').length === 0) {
                        $('#videolocal').append(
                            '<div class="no-video-container">' +
                                '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                '<span class="no-video-text">No webcam available</span>' +
                            '</div>');
                    }
                } else {
                    $('#videolocal .no-video-container').remove();
                    $('#myvideo').removeClass('hide').show();
                }
            },
            onremotestream: function(stream) {
                console.debug(" ::: Got a remote stream :::", stream);
                resizeMultiVideo();
                var addButtons = false;
                if($('#remotevideo').length === 0) {
                    addButtons = true;
                    $('#videoremote').append('<video class="rounded centered video-frame hide" id="remotevideo" position:"absolute" width="100%" height="100%" autoplay playsinline/>');
                    $('#videoremote').append(
                        //'<span class="label label-primary hide" id="curres" style="position: absolute; bottom: 25px; left: 25px;"></span>' +
                        '<span class="label label-info hide" id="curbitrate" style="position: absolute; bottom: 25px; right: 20px;"></span>');
                    // Show the video, hide the spinner and show the resolution when we get a playing event
                    $("#remotevideo").bind("playing", function () {
                        $('#waitingvideo').remove();
                        if(this.videoWidth)
                            $('#remotevideo').removeClass('hide').show();
                        if(spinner)
                            spinner.stop();
                        spinner = null;
                        var width = this.videoWidth;
                        var height = this.videoHeight;
                        $('#curres').removeClass('hide').text(width+'x'+height).show();
                    });
                    $('#callee').removeClass('hide').html(calleeId).show();
                }
                attachMediaStream($('#remotevideo').get(0), stream);
                var videoTracks = stream.getVideoTracks();
                if(!videoTracks || videoTracks.length === 0) {
                    // No remote video
                    $('#remotevideo').hide();
                    if($('#videoremote .no-video-container').length === 0) {
                        $('#videoremote').append(
                            '<div class="no-video-container">' +
                                '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                                '<span class="no-video-text">No remote video available</span>' +
                            '</div>');
                    }
                } else {
                    $('#videoremote .no-video-container').remove();
                    $('#remotevideo').removeClass('hide').show();
                }
                if(!addButtons)
                    return;
                if(adapter.browserDetails.browser === "chrome" ||
                        adapter.browserDetails.browser === "firefox" ||
                        adapter.browserDetails.browser === "safari") {
                    $('#curbitrate').removeClass('hide').show();
                    bitrateTimer[1] = setInterval(function() {
                        // Display updated bitrate, if supported
                        var bitrate = videocall.getBitrate();
                        $('#curbitrate').text(bitrate);
                        // Check if the resolution changed too
                        var width = $("#remotevideo").get(0).videoWidth;
                        var height = $("#remotevideo").get(0).videoHeight;
                        if(width > 0 && height > 0)
                            $('#curres').removeClass('hide').text(width+'x'+height).show();
                    }, 1000);
                }
            },
            ondataopen: function(data) {
                //console.log("The DataChannel is available!");
                $('#videos').removeClass('hide').show();
            },
            ondata: function(data) {
                console.debug("We got data from the DataChannel!", data);
                $('#datarecv').val(data);
            },
            oncleanup: function() {
                //console.log(" ::: Got a cleanup notification :::");
                ringingSound.load();
                $('#myvideo').remove();
                $('#remotevideo').remove();
                $("#videoremote").parent().unblock();
                $('.no-video-container').remove();
                $('#callee').empty().hide();
                $('#curbitrate').hide();
                $('#curres').hide();
                $('#videos').hide();
                $('#curbitrate').hide();
                $('#curres').hide();
                $('roomcontainer').hide();
                if(bitrateTimer[1])
                    clearInterval(bitrateTimer[1]);
                bitrateTimer[1] = null;
                $('#waitingvideo').remove();
                $('#videos').hide();
                simulcastStarted = false;
                $('#simulcast').remove();
                $('#peer').removeAttr('disabled').val('');
                $('#call').removeAttr('disabled').html('Call')
                    .removeClass("btn-danger").addClass("btn-success")
                    .unbind('click').click(doCall);
                afterVideoCallEnd();
            }
        }
    );
}

function setUserName() {
    console.log("setUserName");
    for(var i in groupDataList) {
        var groupData = groupDataList[i];
        var levelGroupList = groupData['level_group_list'];

        for(var i in levelGroupList) {
            var memberList = levelGroupList[i]['member_list'];
            for(var memNum in memberList) {
                var member = memberList[memNum];
                if(member['id'] === calleeId) {
                    calleeName = member['name'];
                    break;
                }
            }
        }
    }
}

function sendCreateRoomRequest(roomTitle, groupId) {
    console.log("sendCreateRoomRequest");
    var data = { type: "local" };
    var body = { data };
    var path = "/onsvc/videoconf/create";
    var data = { title: roomTitle, group_id: groupId };
    body = { data };
    httpAPICall(path, {
        verb: 'POST',
        body: body,
        success: function(json) {
            console.debug(json);
            getConfRoomList();
            bootbox.alert("회의방이 생성되었습니다. 회의방ID=" + json["data"]["room_id"]);
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
}

function sendDestroyRoomRequest(roomId) {
    console.log("sendDestroyRoomRequest");
    var path = "/onsvc/videoconf/destroy";
    var data = { room_id: roomId };
    var body = { data };
    httpAPICall(path, {
        verb: 'POST',
        body: body,
        success: function(json) {
            console.debug(json);
            getConfRoomList();
            bootbox.alert("회의방이 삭제되었습니다.");
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
}

function localFeedForVideoConf(targetRoomId) {
    console.log("localFeedForVideoConf");
    var data = { type: "local" };
    var body = { data };
    _createChannelHandler("/onsvc/videoconf/init", body, {
        success: function(cHandle) {
            sfutest = cHandle;
            //console.log("[VideoRoom] Plugin attached! (ChannelId=" + sfutest.getId() + ")");
            //console.log("  -- This is a publisher/manager");
            var path = "/onsvc/videoconf/join";
            var data = { room_id: targetRoomId }; // roomId
            body = { data };
            roomId = parseInt(targetRoomId);
            httpAPICall(path, {
                verb: 'POST',
                body: body,
                success: function(json) {
                    console.debug(json);
                    localFeedForRecord();
                    localFeedForData();
                },
                error: function(textStatus, errorThrown) {
                    if(errorThrown === "")
                        bootbox.alert(textStatus + ": Is the server down?");
                    else {
                        bootbox.alert(textStatus + ": " + errorThrown);
                    }
                }
            });
        },
        error: function(error) {
            console.error("  -- Error attaching plugin...", error);
            bootbox.alert("Error attaching plugin... " + error); 
        },
        consentDialog: function(on) {
            console.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
            if(on) {
                $.blockUI();
            } else {
                $.unblockUI();
            }
        },
        iceState: function(state) {
            //console.log("ICE state changed to " + state);
        },
        mediaState: function(medium, on) {
            //console.log("WebRTC server " + (on ? "started" : "stopped") + " receiving our " + medium);
        },
        webrtcState: function(on) {
            //console.log("WebRTC server says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
            $("#videolocal").parent().parent().unblock();
            if(!on)
                return;
        },
        onmessage: function(msg, jsep) {
            console.debug(" ::: Got a message (publisher) :::", msg);
            var event = msg["event_type"];
            console.debug("Event: " + event);
            if(event) {
                if(event === "joined") {
                    addLocalFeedLayout();
                    afterVideoRoomJoinSuccess();

                    // Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
                    feedId = msg["id"];
                    mypvtid = msg["private_id"];
                    if(msg["room_owner"]) {
                        roomOwner = true;
                    }
                    //console.log("Successfully joined room " + msg["room_id"] + " with ID " + feedId);
                    $('#myname').text(displayName);
                    //-----FIXME: subscriber_mode 사용 관련 확인 필요
                    if(subscriber_mode) {
                        // afterGetStream();
                    } else {
                        publishOwnFeed(true);
                    }

                    $('#joined_member').append(
                        '<div id="rp' + feedId + '">' +
                            '<div>' + displayName + ' (나)</div>' +
                            '<div>' + '</div>' +
                        '</div>'
                    );

                    // Any new feed to attach to?
                    if(msg["publishers"]) {
                        var list = msg["publishers"];
                        console.debug("Got a list of available publishers/feeds:", list);
                        for(var f in list) {
                            var id = list[f]["id"];
                            var display = list[f]["display"];
                            var audio = list[f]["audio_codec"];
                            var video = list[f]["video_codec"];
                            if(display === "#screensharing") {
                                if(role === "publisher") {
                                    continue;
                                } else {
                                    console.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                    newRemoteFeedForScreenSharing(id, display);
                                    continue;
                                }
                            }
                            console.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                            newRemoteFeed(id, display, audio, video);
                        }
                    }
                } else if(event === "destroyed") {
                    // The room has been destroyed
                    console.warn("The room has been destroyed!");
                    bootbox.alert("회의방이 종료되었습니다.", function() {
                        window.location.reload();
                    });
                } else if(event === "event") {
                    // Any new feed to attach to?
                    if(msg["publishers"]) {
                        var list = msg["publishers"];
                        console.debug("Got a list of available publishers/feeds:", list);
                        for(var f in list) {
                            var id = list[f]["id"];
                            var display = list[f]["display"];
                            var audio = list[f]["audio_codec"];
                            var video = list[f]["video_codec"];
                            if(display === "#screensharing") {
                                if(role === "publisher") {
                                    continue;
                                } else {
                                    console.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                                    newRemoteFeedForScreenSharing(id, display);
                                    continue;
                                }
                            }
                            console.debug("  >> [" + id + "] " + display + " (audio: " + audio + ", video: " + video + ")");
                            newRemoteFeed(id, display, audio, video);
                        }
                    } else if(msg["leaving"]) {
                        // One of the publishers has gone away?
                        var leaving = msg["leaving"];
                        //console.log("Publisher left: " + leaving);
                        var remoteFeed = null;
                        for(var i=1; i<max_member; i++) {
                            if(feeds[i] && feeds[i].rfid == leaving) {
                                remoteFeed = feeds[i];
                                break;
                            }
                        }
                        if(remoteFeed != null) {
                            console.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                            $('#remote'+remoteFeed.rfindex).empty().hide();
                            $('#videoremote'+remoteFeed.rfindex).empty();
                            feeds[remoteFeed.rfindex] = null;
                            remoteFeed.detach();
                            unsubscribe(remoteFeed.getId());
                            $('#rp' + remoteFeed.rfid).remove();
                        } else if(remoteScreenSharingFeed != null && remoteScreenSharingFeed.rfid === leaving) {
                            console.debug("Feed " + remoteScreenSharingFeed.rfid + " (" + remoteScreenSharingFeed.rfdisplay + ") has left the room, detaching");
                            remoteScreenSharingFeed.detach();
                            unsubscribe(remoteScreenSharingFeed.getId());
                            remoteScreenSharingFeed = null;
                        }
                    // } else if(msg["unpublished"]) {
                    //     // One of the publishers has unpublished?
                    //     var unpublished = msg["unpublished"];
                    //     console.log("Publisher left: " + unpublished);
                    //     //--- unpublished: 자기 자신에 대한 것이면 'ok', 다른 사용자에 대한 것이면 'channelId 값'
                    //     if(unpublished === 'ok') {
                    //         // That's us
                    //         sfutest.hangup();
                    //         return;
                    //     }
                    //     var remoteFeed = null;
                    //     for(var i=1; i<max_member; i++) {
                    //         if(feeds[i] && feeds[i].rfid == unpublished) {
                    //             remoteFeed = feeds[i];
                    //             break;
                    //         }
                    //     }
                    //     if(remoteFeed != null) {
                    //         console.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
                    //         $('#remote'+remoteFeed.rfindex).empty().hide();
                    //         $('#videoremote'+remoteFeed.rfindex).empty();
                    //         feeds[remoteFeed.rfindex] = null;
                    //         remoteFeed.detach();
                    //         unsubscribe(remoteFeed.getId());
                    //     }
                    }
                } else if(event === "talking") {
                    var feedId = msg["id"];
                    var remoteFeed = null;
                    for(var i=1; i<max_member; i++) {
                        if(feeds[i] && feeds[i].rfid == feedId) {
                            remoteFeed = feeds[i];
                            break;
                        }
                    }
                    if(remoteFeed != null) {
                        var talking = msg["talking"];
                        if(talking) {
                            $('#r'+remoteFeed.rfindex).css("border", "3px solid orange");
                        } else {
                            $('#r'+remoteFeed.rfindex).css("border", "0px solid orange");
                        }
                    }
                } else if(event === "failure") {
                    bootbox.alert(msg["reason"], function() {
                        doSessionDestory();
                    });
                }
            }
            if(jsep) {
                console.debug("Handling SDP as well...", jsep);
                sfutest.handleRemoteJsep({ jsep: jsep });
                // Check if any of the media we wanted to publish has
                // been rejected (e.g., wrong or unsupported codec)
                var audio = msg["audio_codec"];
                if(mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
                    // Audio has been rejected
                    toastr.warning("Our audio stream has been rejected, viewers won't hear us");
                }
                var video = msg["video_codec"];
                if(mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
                    // Video has been rejected
                    toastr.warning("Our video stream has been rejected, viewers won't see us");
                    // Hide the webcam video
                    $('#myvideo').hide();
                    $('#videolocal').append(
                        '<div class="no-video-container">' +
                            '<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
                            '<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
                        '</div>');
                }
            }
        },
        onlocalstream: function(stream) {
            console.debug(" ::: Got a local stream :::", stream);
            mystream = stream;
            afterGetStreamEvent();
            $('#videolocal').append('<video class="rounded centered" id="myvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>');
            attachMediaStream($('#myvideo').get(0), stream);
            $("#myvideo").get(0).muted = "muted";
            if(sfutest.webrtcStuff.pc.iceConnectionState !== "completed" &&
                    sfutest.webrtcStuff.pc.iceConnectionState !== "connected") {
                $("#videolocal").parent().parent().block({
                    message: '<b>Publishing...</b>',
                    css: {
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'white'
                    }
                });
            }
            var videoTracks = stream.getVideoTracks();
            if(!videoTracks || videoTracks.length === 0) {
                // No webcam
                $('#myvideo').hide();
                if($('#videolocal .no-video-container').length === 0) {
                    $('#videolocal').append(
                        '<div class="no-video-container">' +
                            '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                            '<span class="no-video-text">No webcam available</span>' +
                        '</div>');
                }
            } else {
                $('#videolocal .no-video-container').remove();
                $('#myvideo').removeClass('hide').show();
            }
        },
        onremotestream: function(stream) {
            // The publisher stream is sendonly, we don't expect anything here
        },
        oncleanup: function() {
            //console.log(" ::: Got a cleanup notification: we are unpublished now :::");
            mystream = null;
            roomOwner = false;
            $("#videolocal").parent().parent().unblock();
            //---
            // Reset status
            bootbox.hideAll();
            if(spinner)
                spinner.stop();
            $('#waitingvideo').remove();
            $('#videos').hide();
            $('#curbitrate').hide();
            $('#curres').hide();
            afterVideoCallEnd();
            //--- Clear RemoteFeed
            var remoteFeed = null;
            for(var i=1; i<max_member; i++) {
                remoteFeed = feeds[i];
                if(remoteFeed) {
                    feeds[i] = null;
                    remoteFeed.detach();
                }
            }
            if(sharingOn) {
                role = null;
                stopSharing();
                $('#screen_sharing').html("화면 공유");
                sharingOn = false;
            }
            if(remoteScreenSharingFeed) {
                remoteScreenSharingFeed.detach();
                remoteScreenSharingFeed = null;
            }

            $('#room').hide();
            $('#screen_sharing').hide();
            $('#members *').remove();
        }
    });
}

function joinTextRoom(roomId) {
    console.log("joinTextRoom");
    var transaction = randomString(12);
    var register = {
        textroom: "join",
        transaction: transaction,
        room: roomId,
        username: userId,
        display: displayName
    };
    transactions[transaction] = function(response) {
        if(response["textroom"] === "error") {
            // Something went wrong
            if(response["error_code"] === 417) {
                // This is a "no such room" error: give a more meaningful description
                bootbox.alert("회의방이 존재하지 않습니다(" + roomId + ").");
            } else {
                bootbox.alert(response["error"]);
            }
            return;
        }
        // We're in
        afterTextRoomJoinSuccess();
        // Any participants already in?
        //console.log("Participants:", response.participants);
        if(response.participants && response.participants.length > 0) {
            for(var i in response.participants) {
                var p = response.participants[i];
                participants[p.username] = p.display ? p.display : p.username;
                $('#chatroom').append('<p style="color: green;">[' + getDateString() + '] <i>' + participants[p.username] + ' joined</i></p>');
                $('#chatroom').get(0).scrollTop = $('#chatroom').get(0).scrollHeight;
            }
        }
    };
    textroom.data({
        text: JSON.stringify(register),
        error: function(reason) {
            bootbox.alert(reason);
        }
    });
}

function newRemoteFeed(id, display, audio, video) {
    console.log("newRemoteFeed");
    // Init remote channel
    // A new feed has been published, create a new plugin handle and attach to it as a subscriber
	var remoteFeed = null;
    var data = { type: "remote" };
    var body = { data: data };
    _createChannelHandler("/onsvc/videoconf/init", body, {
        success: function(channelHandler) {
            remoteFeed = channelHandler;
            // remoteFeed.simulcastStarted = false;
            //console.log("Plugin attached! (ChannelId=" + remoteFeed.getId() + ")");
            //console.log("  -- This is a subscriber");
            remoteFeed.videoCodec = video;
            // join 요청 필요
            var data = { type: "request", cid: remoteFeed.getId(), feed: id };
            var request = { data };
            httpAPICall("/onsvc/videoconf/subscribe", {
                verb: 'POST',
                body: request,
                success: function(json) {
                    console.debug(json);
                },
                error: function(textStatus, errorThrown) {
                    if(errorThrown === "")
                        bootbox.alert(textStatus + ": Is the server down?");
                    else {
                        bootbox.alert(textStatus + ": " + errorThrown);
                    }
                }
            });
        },
        error: function(error) {
            console.error("  -- Error attaching plugin...", error);
            bootbox.alert("Error attaching plugin... " + error);
        },
        onmessage: function(msg, jsep) {
            console.debug(" ::: Got a message (subscriber) :::", msg);
            var event = msg["event_type"];
            console.debug("Event: " + event);
            if(msg["error"]) { //--> FIXME: 추후 변경할 것
                bootbox.alert(msg["error"]);
            } else if(event) {
                if(event === "subscribe") {
                    // Subscriber created and attached
                    for(var i=1;i<max_member;i++) {
                        if(!feeds[i]) {
                            feeds[i] = remoteFeed;
                            remoteFeed.rfindex = i;
                            break;
                        }
                    }
                    remoteFeed.rfid = msg["id"];
                    remoteFeed.rfdisplay = msg["name"];
                    if(!remoteFeed.spinner) {
                        var target = document.getElementById('videoremote'+remoteFeed.rfindex);
                        remoteFeed.spinner = new Spinner({top:100}).spin(target);
                    } else {
                        remoteFeed.spinner.spin();
                    }
                    //console.log("Successfully attached to feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") in room " + msg["room_id"]);
                    addRemoteFeedLayout(remoteFeed);

                    $('#joined_member').append(
                        '<div id="rp' + remoteFeed.rfid + '">' +
                            '<div>' + remoteFeed.rfdisplay + '</div>' +
                        '</div>'
                    );
                } else if(event === "event") {
                    // Check if we got a simulcast-related event from this publisher
                    var substream = msg["substream"];
                    var temporal = msg["temporal"];
                    if((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
                        if(!remoteFeed.simulcastStarted) {
                            remoteFeed.simulcastStarted = true;
                            // Add some new buttons
                            addSimulcastButtons(remoteFeed.rfindex, remoteFeed.videoCodec === "vp8" || remoteFeed.videoCodec === "h264");
                        }
                        // We just received notice that there's been a switch, update the buttons
                        updateSimulcastButtons(remoteFeed.rfindex, substream, temporal);
                    }
                } else {
                    // What has just happened?
                }
            }
            if(jsep) {
                console.debug("Handling SDP as well...", jsep);
                // Answer and attach
                remoteFeed.createAnswer(
                    {
                        jsep: jsep,
                        // Add data:true here if you want to subscribe to datachannels as well
                        // (obviously only works if the publisher offered them in the first place)
                        media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                        success: function(jsep) {
                            console.debug("Got SDP!", jsep);
                            var data = { type: 'answer', jsep: jsep, cid: remoteFeed.getId() };
                            var request = { data };
                            httpAPICall("/onsvc/videoconf/subscribe", {
                                verb: 'POST',
                                body: request,
                                success: function(json) {
                                    console.debug(json);
                                },
                                error: function(textStatus, errorThrown) {
                                    if(errorThrown === "")
                                        bootbox.alert(textStatus + ": Is the server down?");
                                    else {
                                        bootbox.alert(textStatus + ": " + errorThrown);
                                    }
                                }
                            });
                        },
                        error: function(error) {
                            console.error("WebRTC error:", error);
                            bootbox.alert("WebRTC error... " + error.message);
                        }
                    });
            }
        },
        iceState: function(state) {
            //console.log("ICE state of this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") changed to " + state);
        },
        webrtcState: function(on) {
            //console.log("Server says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now");
        },
        onlocalstream: function(stream) {
            // The subscriber stream is recvonly, we don't expect anything here
        },
        onremotestream: function(stream) {
            console.debug("Remote feed #" + remoteFeed.rfindex + ", stream:", stream);
            var addButtons = false;
            if($('#remotevideo'+remoteFeed.rfindex).length === 0) {
                addButtons = true;
                // No remote video yet
                $('#videoremote'+remoteFeed.rfindex).append('<video class="rounded centered video-frame" id="waitingvideo' + remoteFeed.rfindex + '" width="100%" height="100%" />');
                $('#videoremote'+remoteFeed.rfindex).append('<video class="rounded centered video-frame hide" id="remotevideo' + remoteFeed.rfindex + '" width="100%" height="100%" autoplay playsinline/>');
                $('#videoremote'+remoteFeed.rfindex).append(
                    //'<span class="label label-primary hide" id="curres'+remoteFeed.rfindex+'" style="position: absolute; bottom: 12px; left: 12px;"></span>' +
                    '<span class="label label-info hide" id="curbitrate'+remoteFeed.rfindex+'" style="position: absolute; bottom: 12px; right: 12px;"></span>');
                // Show the video, hide the spinner and show the resolution when we get a playing event
                $("#remotevideo"+remoteFeed.rfindex).bind("playing", function () {
                    if(remoteFeed.spinner)
                        remoteFeed.spinner.stop();
                    remoteFeed.spinner = null;
                    $('#waitingvideo'+remoteFeed.rfindex).remove();
                    if(this.videoWidth)
                        $('#remotevideo'+remoteFeed.rfindex).removeClass('hide').show();
                    var width = this.videoWidth;
                    var height = this.videoHeight;
                    $('#curres'+remoteFeed.rfindex).removeClass('hide').text(width+'x'+height).show();
                    if(adapter.browserDetails.browser === "firefox") {
                    	// Firefox Stable has a bug: width and height are not immediately available after a playing
                    	setTimeout(function() {
                    		var width = $("#remotevideo"+remoteFeed.rfindex).get(0).videoWidth;
                    		var height = $("#remotevideo"+remoteFeed.rfindex).get(0).videoHeight;
                    		$('#curres'+remoteFeed.rfindex).removeClass('hide').text(width+'x'+height).show();
                    	}, 2000);
                    }
                });
            }
            attachMediaStream($('#remotevideo'+remoteFeed.rfindex).get(0), stream);
            var videoTracks = stream.getVideoTracks();
            if(!videoTracks || videoTracks.length === 0) {
                // No remote video
                $('#remotevideo' + remoteFeed.rfindex).hide();
                if($('#videoremote'+remoteFeed.rfindex + ' .no-video-container').length === 0) {
                    $('#videoremote'+remoteFeed.rfindex).append(
                        '<div class="no-video-container">' +
                            '<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
                            '<span class="no-video-text">No remote video available</span>' +
                        '</div>');
                }
            } else {
                $('#videoremote'+remoteFeed.rfindex+ ' .no-video-container').remove();
                $('#remotevideo' + remoteFeed.rfindex).removeClass('hide').show();
            }
            if(!addButtons)
                return;
            if(adapter.browserDetails.browser === "chrome" || adapter.browserDetails.browser === "firefox" ||
                    adapter.browserDetails.browser === "safari") {
            	$('#curbitrate'+remoteFeed.rfindex).removeClass('hide').show();
            	bitrateTimer[remoteFeed.rfindex] = setInterval(function() {
            		// Display updated bitrate, if supported
            		var bitrate = remoteFeed.getBitrate();
            		$('#curbitrate'+remoteFeed.rfindex).text(bitrate);
            		// Check if the resolution changed too
            		var width = 0;
                    var height = 0;
                    if($("#remotevideo"+remoteFeed.rfindex).get(0)) {
                        width = $("#remotevideo"+remoteFeed.rfindex).get(0).videoWidth;
                        height = $("#remotevideo"+remoteFeed.rfindex).get(0).videoHeight;
                    }
            		if(width > 0 && height > 0)
            			$('#curres'+remoteFeed.rfindex).removeClass('hide').text(width+'x'+height).show();
            	}, 1000);
            }
        },
        oncleanup: function() {
            //console.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
            if(remoteFeed.spinner)
                remoteFeed.spinner.stop();
            remoteFeed.spinner = null;
            $('#remotevideo'+remoteFeed.rfindex).remove();
            $('#waitingvideo'+remoteFeed.rfindex).remove();
            $('#novideo'+remoteFeed.rfindex).remove();
            $('#curbitrate'+remoteFeed.rfindex).remove();
            $('#curres'+remoteFeed.rfindex).remove();
            if(bitrateTimer[remoteFeed.rfindex])
                clearInterval(bitrateTimer[remoteFeed.rfindex]);
            bitrateTimer[remoteFeed.rfindex] = null;
            remoteFeed.simulcastStarted = false;
            $('#simulcast'+remoteFeed.rfindex).remove();

            $('#r'+remoteFeed.rfindex).remove();
            resizeMultiVideo();
        }
    });
}

function localFeedForScreenSharing() {
    console.log("localFeedForScreenSharing");
    var data = { type: "screen" };
    var body = { data: data };
    _createChannelHandler("/onsvc/videoconf/init", body, {
        success: function(cHandle) {
            $('#details').remove();
            screentest = cHandle;
            //console.log("Plugin attached! (ChannelId=" + screentest.getId() + ")");
            if(role === "publisher") {
                preShareScreen();
            }
        },
        error: function(error) {
            console.error("  -- Error attaching plugin...", error);
            bootbox.alert("Error attaching plugin... " + error);
        },
        consentDialog: function(on) {
            console.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
            if(on) {
                $.blockUI();
            } else {
                $.unblockUI();
            }
        },
        iceState: function(state) {
            //console.log("ICE state changed to " + state);
        },
        mediaState: function(medium, on) {
            //console.log("WebRTC server " + (on ? "started" : "stopped") + " receiving our " + medium);
            if(!on) {
                // stopSharing();
            }
        },
        webrtcState: function(on) {
            //console.log("WebRTC server says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
            $("#screencapture").parent().unblock();
            if(on) {
                sharingOn = true;
                changeScreenSharingBitrate("1024"); // 512 1024 1536
            } else {
                //----- FIXME 화면공유 중단 후 처리할 사항이 있는가?
                // bootbox.alert("Your screen sharing session just stopped.", function() {
                //     janus.destroy();
                //     window.location.reload();
                // });
                //-----
                // if(!sharingOn) {
                //     bootbox.alert("화면공유를 시작하지 못했습니다. 잠시후 다시 시도해주시기 바랍니다.");
                //     btnChange("screen_sharing", false);
                // }
            }
        },
        onmessage: function(msg, jsep) {
            console.debug(" ::: Got a message (publisher) :::", msg);
            var event = msg["event_type"];
            console.debug("Event: " + event);
            if(event) {
                if(event === "joined") {
                    feedId = msg["id"];
                    //console.log("Successfully joined room " + msg["room_id"] + " with ID " + feedId);
                    if(role === "publisher") {
                        // This is our session, publish our stream
                        console.debug("Negotiating WebRTC stream for our screen (capture " + capture + ")");
                        // Safari expects a user gesture to share the screen: see issue #2455
                        if(adapter.browserDetails.browser === "safari") {
                            bootbox.alert("Safari requires a user gesture before the screen can be shared: close this dialog to do that. See issue #2455 for more details", function() {
                                screentest.createOffer(
                                    {
                                        // media: { video: capture, audioSend: true, videoRecv: false},	// Screen sharing Publishers are sendonly
                                        media: { video: capture, audioSend: false, audioRecv: false, videoRecv: false},	// Screen sharing Publishers are sendonly
                                        success: function(jsep) {
                                            console.debug("Got publisher SDP!", jsep);
                                            var publish = { request: "configure", audio: true, video: true };
                                            screentest.send({ message: publish, jsep: jsep });
                                        },
                                        error: function(error) {
                                            console.error("WebRTC error:", error);
                                            // bootbox.alert("WebRTC error... " + error.message);
                                            stopSharing();
                                        }
                                    });
                            });
                        } else {
                            // Other browsers should be fine, we try to call getDisplayMedia directly
                            screentest.createOffer(
                                {
                                    // media: { video: capture, audioSend: true, videoRecv: false},	// Screen sharing Publishers are sendonly
                                    media: { video: capture, audioSend: false, audioRecv: false, videoRecv: false},
                                    success: function(jsep) {
                                        console.debug("Got ScreenSharing SDP!", jsep);
                                        var data = { request: "media", cid: screentest.getId(), audio: false, video: true, jsep: jsep };
                                        var request = { type: "videoconf", data: data };
                                        httpAPICall("/onsvc/videoconf/configure", {
                                            verb: 'POST',
                                            userId: $('#login_id').val(),
                                            body: request,
                                            success: function(json) {
                                                console.debug(json);
                                            },
                                            error: function(textStatus, errorThrown) {
                                                if(errorThrown === "")
                                                    bootbox.alert(textStatus + ": Is the server down?");
                                                else {
                                                    bootbox.alert(textStatus + ": " + errorThrown);
                                                }
                                            }
                                        });
                                    },
                                    error: function(error) {
                                        console.error("WebRTC error:", error);
                                        stopSharing();
                                    }
                                });
                        }
                        btnChange("screen_sharing", true);
                    } else {
                        // We're just watching a session, any feed to attach to?
                        if(msg["publishers"]) {
                            var list = msg["publishers"];
                            console.debug("Got a list of available publishers/feeds:", list);
                            for(var f in list) {
                                var id = list[f]["id"];
                                var display = list[f]["display"];
                                console.debug("  >> [" + id + "] " + display);
                                newRemoteFeedForScreenSharing(id, display)
                            }
                        }
                    }
                } else if(event === "event") {
                    // Any feed to attach to?
                    if(role === "listener" && msg["publishers"]) {
                        var list = msg["publishers"];
                        console.debug("Got a list of available publishers/feeds:", list);
                        for(var f in list) {
                            var id = list[f]["id"];
                            var display = list[f]["display"];
                            console.debug("  >> [" + id + "] " + display);
                            newRemoteFeedForScreenSharing(id, display)
                        }
                    } else if(msg["leaving"]) {
                        // One of the publishers has gone away?
                        var leaving = msg["leaving"];
                        //----- FIXME: 주관자가 방을 나간 경우에 어떻게 처리할지 생각해봐야 함
                        // if(role === "listener" && msg["leaving"] === source) {
                        //     bootbox.alert("The screen sharing session is over, the publisher left", function() {
                        //         window.location.reload();
                        //     });
                        // }
                        //-----
                        if(role === "listener" && msg["leaving"] === source) {
                            //console.log("ScreenSharing Publisher left: " + leaving);
                            $('#room').hide();
                            sharingOn = false;
                            resizeMultiVideo();
                        }
                        //-----
                    } else if(msg["error"]) {
                        bootbox.alert(msg["error"]);
                    }
                }
            }
            if(jsep) {
                console.debug("Handling SDP as well...", jsep);
                screentest.handleRemoteJsep({ jsep: jsep });
            }
        },
        onlocalstream: function(stream) {
            console.debug(" ::: Got a local stream :::", stream);
            $('#screenmenu').hide();
            $('#room').removeClass('hide').show();
            $('roomcontainer').hide();
            resizeMultiVideo();
            if($('#screenvideo').length === 0) {
                $('#screencapture').append('<video class="rounded centered" id="screenvideo" width="100%" height="100%" autoplay playsinline muted="muted"/>');
            }
            attachMediaStream($('#screenvideo').get(0), stream);
            if(screentest.webrtcStuff.pc.iceConnectionState !== "completed" &&
                    screentest.webrtcStuff.pc.iceConnectionState !== "connected") {
                $("#screencapture").parent().block({
                    message: '<b>Publishing...</b>',
                    css: {
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: 'white'
                    }
                });
            }
        },
        onremotestream: function(stream) {
            // The publisher stream is sendonly, we don't expect anything here
        },
        oncleanup: function() {
            //console.log(" ::: Got a cleanup notification :::");
            $('#screencapture').empty();
            $("#screencapture").parent().unblock();
            $('#room').hide();
            sharingOn = false;
            resizeMultiVideo();
        }
    });
}

var remoteScreenSharingFeed = null;
function newRemoteFeedForScreenSharing(id, display) {
    console.log("newRemoteFeedForScreenSharing");
    source = id;
	var remoteFeed = null;
    var data = { type: "remote" };
    var body = { data: data };
    _createChannelHandler("/onsvc/videoconf/init", body, {
        success: function(cHandle) {
            remoteFeed = cHandle;
            remoteFeed.rfid = id;
            remoteFeed.rfdisplay = display;
            remoteScreenSharingFeed = remoteFeed;
            //console.log("Plugin attached! (id=" + remoteFeed.getId() + ")");
            //console.log("  -- This is a subscriber");

            var data = { type: "request", cid: remoteFeed.getId(), feed: id };
            var request = { data };
            httpAPICall("/onsvc/videoconf/subscribe", {
                verb: 'POST',
                body: request,
                success: function(json) {
                    console.debug(json);
                },
                error: function(textStatus, errorThrown) {
                    if(errorThrown === "")
                        bootbox.alert(textStatus + ": Is the server down?");
                    else {
                        bootbox.alert(textStatus + ": " + errorThrown);
                    }
                }
            });
        },
        error: function(error) {
            console.error("  -- Error attaching plugin...", error);
            bootbox.alert("Error attaching plugin... " + error);
        },
        iceState: function(state) {
            //console.log("ICE state changed to " + state);
        },
        mediaState: function(medium, on) {
            //console.log("WebRTC server " + (on ? "started" : "stopped") + " receiving our " + medium);
            if(!on) {
                // stopSharing();
                console.error("No!!!!!");
            }
        },
        webrtcState: function(on) {
            //console.log("WebRTC server says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
            $("#screencapture").parent().unblock();
            // if(on) {
            //     changeScreenSharingBitrate("1536");
            // } else {
            //     //----- FIXME 화면공유 중단 후 처리할 사항이 있는가?
            //     // bootbox.alert("Your screen sharing session just stopped.", function() {
            //     //     window.location.reload();
            //     // });
            //     //-----
            // }
        },
        onmessage: function(msg, jsep) {
            console.debug(" ::: Got a message (listener) :::", msg);
            var event = msg["event_type"];
            console.debug("Event: " + event);
            if(event) {
                if(event === "subscribe") {
                    // Subscriber created and attached
                    if(!spinner) {
                        var target = document.getElementById('#screencapture');
                        spinner = new Spinner({top:100}).spin(target);
                    } else {
                        spinner.spin();
                    }
                    //console.log("[ScreenSharing] Successfully attached to feed " + msg["id"] + " (" + display + ") in room " + msg["room_id"]);
                    sharingOn = true;
                    $('#screenmenu').hide();
                    $('#room').removeClass('hide').show();
                    resizeMultiVideo();
                } else {
                    // What has just happened?
                }
            }
            if(jsep) {
                console.debug("Handling SDP as well...", jsep);
                remoteFeed.createAnswer(
                    {
                        jsep: jsep,
                        media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
                        success: function(jsep) {
                            console.debug("Got SDP!", jsep);
                            var data = { type: 'answer', jsep: jsep, cid: remoteFeed.getId() };
                            var request = { data };
                            httpAPICall("/onsvc/videoconf/subscribe", {
                                verb: 'POST',
                                body: request,
                                success: function(json) {
                                    console.debug(json);
                                },
                                error: function(textStatus, errorThrown) {
                                    if(errorThrown === "")
                                        bootbox.alert(textStatus + ": Is the server down?");
                                    else {
                                        bootbox.alert(textStatus + ": " + errorThrown);
                                    }
                                }
                            });
                        },
                        error: function(error) {
                            console.error("WebRTC error:", error);
                            bootbox.alert("WebRTC error... " + error.message);
                        }
                    });
            }
        },
        onlocalstream: function(stream) {
            // The subscriber stream is recvonly, we don't expect anything here
        },
        onremotestream: function(stream) {
            if($('#screenvideo').length === 0) {
                // No remote video yet
                $('#screencapture').append('<video class="rounded centered" id="waitingvideo" width="100%" height="100%" />');
                $('#screencapture').append('<video class="rounded centered hide" id="screenvideo" width="100%" height="100%" playsinline/>');
                $('#screenvideo').get(0).volume = 0;
                // Show the video, hide the spinner and show the resolution when we get a playing event
                $("#screenvideo").bind("playing", function () {
                    $('#waitingvideo').remove();
                    $('#screenvideo').removeClass('hide');
                    if(spinner)
                        spinner.stop();
                    spinner = null;
                });
            }
            // FIXME: 아래 에러 처리를 어떻게 해야하는가?
            // Uncaught (in promise) DOMException: The play() request was interrupted by a new load request. 
            //---s 
            // var playPromise = $("#screenvideo").get(0).play();
            // console.log("############################################# 111");
            // if(playPromise !== undefined) {
            //     playPromise.then(_ => {
            //         console.log("############################################# 222");
            //         attachMediaStream($('#screenvideo').get(0), stream);
            //         $("#screenvideo").get(0).volume = 1;
            //     }).catch(error => {
            //         console.log("############################################# 333", error);
            //     });
            // }
            //---e
            attachMediaStream($('#screenvideo').get(0), stream);
            $("#screenvideo").get(0).play();
            $("#screenvideo").get(0).volume = 1;
        },
        oncleanup: function() {
            //console.log(" ::: Got a cleanup notification (remote feed " + id + ") :::");
            $('#waitingvideo').remove();
            $('#screencapture').empty();
            $("#screencapture").parent().unblock();
            $('#room').hide();
            sharingOn = false;
            resizeMultiVideo();
        }
    });
}

function stopSharing() {
    console.log("stopSharing");
    if(screentest) {
        doStopScreenSharing();
    }
    if(spinner)
        spinner.stop();
    spinner = null;
    btnChange("screen_sharing", false);
}

function preShareScreen() {
    console.log("preShareScreen");
	if(!_isExtensionEnabled()) {
		bootbox.alert("You're using Chrome but don't have the screensharing extension installed: click <b><a href='https://chrome.google.com/webstore/detail/janus-webrtc-screensharin/hapfgfdkleiggjjpfpenajgdnfckjpaj' target='_blank'>here</a></b> to do so", function() {
			// window.location.reload();
            //---FIXME: 
		});
		return;
	}
	// Create a new room
	capture = "screen";
    shareScreen();

}

function shareScreen() {
    console.log("shareScreen");
	role = "publisher";
    var data = { cid: screentest.getId() };
    var request = { data };
    httpAPICall("/onsvc/videoconf/screensharing", {
        verb: 'POST',
        body: request,
        success: function(json) {
            console.debug(json);
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
}

function testSharing() {
    console.log("testSharing");
    if(!sharingOn) {
        role = "publisher";
        createScreenSharingHandler();
        sharingOn = true;
    } else {
        role = null;
        stopSharing();
        sharingOn = false;
        resizeMultiVideo();
    }
}

function localFeedForRecord() {
    console.log("localFeedForRecord");
    _createRecordHandler({
        success: function(pluginHandle) {
            recordplay = pluginHandle;
            //console.log("Plugin attached! (id=" + recordplay.getId() + ")");
        },
        error: function(error) {
            console.error("  -- Error attaching plugin...", error);
            bootbox.alert("  -- Error attaching plugin... " + error);
        },
        consentDialog: function(on) {
            console.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
            if(on) {
                $.blockUI();
            } else {
                $.unblockUI();
            }
        },
        iceState: function(state) {
            //console.log("ICE state changed to " + state);
        },
        mediaState: function(medium, on) {
            //console.log("WebRTC server " + (on ? "started" : "stopped") + " receiving our " + medium);
        },
        webrtcState: function(on) {
            //console.log("WebRTC server says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
        },
        onmessage: function(msg, jsep) {
            console.debug(" ::: Got a message :::", msg);
            var eventType = msg["event_type"];
            if(eventType === "event") {
                var result = msg["result"];
                if(result) {
                    if(result["status"]) {
                        var event = result["status"];
                        console.debug("Event: " + event);
                        if(event === 'preparing' || event === 'refreshing') {
                            //console.log("Preparing the recording playout");
                            recordplay.createAnswer(
                                {
                                    jsep: jsep,
                                    media: { audioSend: false, videoSend: false, data: true },	// We want recvonly audio/video
                                    success: function(jsep) {
                                        console.debug("Got SDP!", jsep);
                                        var body = { request: "start" };
                                        recordplay.send({ message: body, jsep: jsep });
                                    },
                                    error: function(error) {
                                        console.error("WebRTC error:", error);
                                        bootbox.alert("WebRTC error... " + error.message);
                                    }
                                });
                            if(result["warning"])
                                bootbox.alert(result["warning"]);
                        } else if(event === 'recording') {
                            // Got an ANSWER to our recording OFFER
                            if(jsep)
                                recordplay.handleRemoteJsep({ jsep: jsep });
                            var id = result["id"];
                            if(id) {
                                //console.log("The ID of the current recording is " + id);
                                recordingId = id;
                            }
                        } else if(event === 'playing') {
                            //console.log("Playout has started!");
                        } else if(event === 'stopped') {
                            //console.log("Session has stopped!");
                            // FIXME Reset status
                            recordingId = null;
                            recording = false;
                            playing = false;
                            recordplay.hangup();
                        }
                    }
                } else {
                    // FIXME Error?
                    var error = msg["error"];
                    bootbox.alert(error);
                    // FIXME Reset status
                    recording = false;
                    playing = false;
                    recordplay.hangup();
                }
            } 
        },
        onlocalstream: function(stream) {
            //--- Not used
        },
        onremotestream: function(stream) {
            //--- Not used
        },
        oncleanup: function() {
            //console.log(" ::: Got a cleanup notification :::");
            // FIXME Reset status
            if(spinner)
                spinner.stop();
            spinner = null;
            if(recordplay.bitrateTimer)
                clearInterval(recordplay.bitrateTimer);
            delete recordplay.bitrateTimer;
            recording = false;
            playing = false;
        }
    });
}

function localFeedForData() {
    console.log("localFeedForData");
    _createDataHandler({
        success: function(pluginHandle) {
            textroom = pluginHandle;
            //console.log("[TextRoom] Plugin attached! (id=" + textroom.getId() + ")");
            // Setup the DataChannel
            setupChatting();
        },
        error: function(error) {
            console.error("  -- Error attaching plugin...", error);
            bootbox.alert("Error attaching plugin... " + error);
        },
        iceState: function(state) {
            //console.log("ICE state changed to " + state);
        },
        mediaState: function(medium, on) {
            //console.log("WebRTC server " + (on ? "started" : "stopped") + " receiving our " + medium);
        },
        webrtcState: function(on) {
            //console.log("WebRTC server says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
            if(on) {
                afterTextRoomJoinSuccess();
            }
        },
        onmessage: function(msg, jsep) {
            console.debug(" ::: Got a message :::", msg);
            if(msg["error"]) {
                bootbox.alert(msg["error"]);
            }
            if(jsep) {
                // Answer
                textroom.createAnswer(
                    {
                        jsep: jsep,
                        media: { audio: false, video: false, data: true },	// We only use datachannels
                        success: function(jsep) {
                            console.debug("Got SDP!", jsep);
                            var data = { request: "answer", jsep: jsep };
                            var request = { data: data };
                            httpAPICall("/onsvc/text", {
                                verb: 'POST',
                                body: request,
                                success: function(json) {
                                    console.debug(json);
                                    joinTextRoom(roomId);
                                },
                                error: function(textStatus, errorThrown) {
                                    if(errorThrown === "")
                                        bootbox.alert(textStatus + ": Is the server down?");
                                    else {
                                        bootbox.alert(textStatus + ": " + errorThrown);
                                    }
                                }
                            });
                        },
                        error: function(error) {
                            console.error("WebRTC error:", error);
                            bootbox.alert("WebRTC error... " + error.message);
                        }
                    });
            }
        },
        ondataopen: function(data) {
            //console.log("The DataChannel is available!");
        },
        ondata: function(data) {
            console.debug("We got data from the DataChannel!", data);
            //~ $('#datarecv').val(data);
            var json = JSON.parse(data);
            var transaction = json["transaction"];
            if(transactions[transaction]) {
                // Someone was waiting for this
                transactions[transaction](json);
                delete transactions[transaction];
                return;
            }
            var what = json["textroom"];
            if(what === "message") {
                // Incoming message: public or private?
                var msg = json["text"];
                msg = msg.replace(new RegExp('<', 'g'), '&lt');
                msg = msg.replace(new RegExp('>', 'g'), '&gt');
                var from = json["from"];
                var dateString = getDateString(json["date"]);
                var whisper = json["whisper"];
                if(whisper === true) {
                    // Private message
                    $('#chatroom').append('<p style="color: purple;">[' + dateString + '] <b>[whisper from ' + participants[from] + ']</b> ' + msg);
                    $('#chatroom').get(0).scrollTop = $('#chatroom').get(0).scrollHeight;
                } else {
                    // Public message
                    $('#chatroom').append('<p>[' + dateString + '] <b>' + participants[from] + ':</b> ' + msg);
                    $('#chatroom').get(0).scrollTop = $('#chatroom').get(0).scrollHeight;
                }
            } else if(what === "announcement") {
                // Room announcement
                var msg = json["text"];
                msg = msg.replace(new RegExp('<', 'g'), '&lt');
                msg = msg.replace(new RegExp('>', 'g'), '&gt');
                var dateString = getDateString(json["date"]);
                $('#chatroom').append('<p style="color: purple;">[' + dateString + '] <i>' + msg + '</i>');
                $('#chatroom').get(0).scrollTop = $('#chatroom').get(0).scrollHeight;
            } else if(what === "join") {
                // Somebody joined
                var username = json["username"];
                var display = json["display"];
                participants[username] = display ? display : username;
                if(username !== userId && $('#rp' + username).length === 0) {
                    // Add to the participants list
                    // $('#list').append('<li id="rp' + username + '" class="list-group-item">' + participants[username] + '</li>');
                    // $('#rp' + username).css('cursor', 'pointer').click(function() {
                    //     var username = $(this).attr('id').split("rp")[1];
                    //     sendPrivateMsg(username);
                    // });
                }
                $('#chatroom').append('<p style="color: green;">[' + getDateString() + '] <i>' + participants[username] + ' joined</i></p>');
                $('#chatroom').get(0).scrollTop = $('#chatroom').get(0).scrollHeight;
            } else if(what === "leave") {
                // Somebody left
                var username = json["username"];
                var when = new Date();
                $('#rp' + username).remove();
                $('#chatroom').append('<p style="color: green;">[' + getDateString() + '] <i>' + participants[username] + ' left</i></p>');
                $('#chatroom').get(0).scrollTop = $('#chatroom').get(0).scrollHeight;
                delete participants[username];
            } else if(what === "kicked") {
                // Somebody was kicked
                var username = json["username"];
                var when = new Date();
                $('#rp' + username).remove();
                $('#chatroom').append('<p style="color: green;">[' + getDateString() + '] <i>' + participants[username] + ' was kicked from the room</i></p>');
                $('#chatroom').get(0).scrollTop = $('#chatroom').get(0).scrollHeight;
                delete participants[username];
                if(username === userId) {
                    bootbox.alert("You have been kicked from the room", function() {
                        window.location.reload();
                    });
                }
            } else if(what === "destroyed") {
                if(json["room_id"] !== roomId) {
                    return;
                }
                // Room was destroyed, goodbye!
                console.warn("The room has been destroyed!");
                // bootbox.alert("The room has been destroyed", function() {
                //     window.location.reload();
                // });
            }
        },
        oncleanup: function() {
            //console.log(" ::: Got a cleanup notification :::");
            $('#datasend').attr('disabled', true);
        }
    });
}

// Helper to format times
function getDateString(jsonDate) {
    console.log(getDateString = "getDateString(73)");
	var when = new Date();
	if(jsonDate) {
		when = new Date(Date.parse(jsonDate));
	}
	var dateString =
			// ("0" + when.getUTCHours()).slice(-2) + ":" +
			// ("0" + when.getUTCMinutes()).slice(-2) + ":" +
			// ("0" + when.getUTCSeconds()).slice(-2);
            ("0" + when.getHours()).slice(-2) + ":" +
			("0" + when.getMinutes()).slice(-2) + ":" +
			("0" + when.getSeconds()).slice(-2);
	return dateString;
}

// Helper methods to parse a media object
function _isAudioSendEnabled(media) {
    console.log("_isAudioSendEnabled");
    console.debug("isAudioSendEnabled:", media);
    if(!media)
        return true;	// Default
    if(media.audio === false)
        return false;	// Generic audio has precedence
    if(media.audioSend === undefined || media.audioSend === null)
        return true;	// Default
    return (media.audioSend === true);
}

function _isAudioSendRequired(media) {
    console.log("_isAudioSendRequired");
    console.debug("isAudioSendRequired:", media);
    if(!media)
        return false;	// Default
    if(media.audio === false || media.audioSend === false)
        return false;	// If we're not asking to capture audio, it's not required
    if(media.failIfNoAudio === undefined || media.failIfNoAudio === null)
        return false;	// Default
    return (media.failIfNoAudio === true);
}

function _isAudioRecvEnabled(media) {
    console.log("_isAudioRecvEnabled");
    console.debug("isAudioRecvEnabled:", media);
    if(!media)
        return true;	// Default
    if(media.audio === false)
        return false;	// Generic audio has precedence
    if(media.audioRecv === undefined || media.audioRecv === null)
        return true;	// Default
    return (media.audioRecv === true);
}

function _isVideoSendEnabled(media) {
    console.log("_isVideoSendEnabled");
    console.debug("isVideoSendEnabled:", media);
    if(!media)
        return true;	// Default
    if(media.video === false)
        return false;	// Generic video has precedence
    if(media.videoSend === undefined || media.videoSend === null)
        return true;	// Default
    return (media.videoSend === true);
}

function _isVideoSendRequired(media) {
    console.log("_isVideoSendRequired");
    console.debug("isVideoSendRequired:", media);
    if(!media)
        return false;	// Default
    if(media.video === false || media.videoSend === false)
        return false;	// If we're not asking to capture video, it's not required
    if(media.failIfNoVideo === undefined || media.failIfNoVideo === null)
        return false;	// Default
    return (media.failIfNoVideo === true);
}

function _isVideoRecvEnabled(media) {
    console.log("_isVideoRecvEnabled");
    console.debug("isVideoRecvEnabled:", media);
    if(!media)
        return true;	// Default
    if(media.video === false)
        return false;	// Generic video has precedence
    if(media.videoRecv === undefined || media.videoRecv === null)
        return true;	// Default
    return (media.videoRecv === true);
}

function _isScreenSendEnabled(media) {
    console.log("_isScreenSendEnabled");
    console.debug("isScreenSendEnabled:", media);
    if (!media)
        return false;
    if (typeof media.video !== 'object' || typeof media.video.mandatory !== 'object')
        return false;
    var constraints = media.video.mandatory;
    if (constraints.chromeMediaSource)
        return constraints.chromeMediaSource === 'desktop' || constraints.chromeMediaSource === 'screen';
    else if (constraints.mozMediaSource)
        return constraints.mozMediaSource === 'window' || constraints.mozMediaSource === 'screen';
    else if (constraints.mediaSource)
        return constraints.mediaSource === 'window' || constraints.mediaSource === 'screen';
    return false;
}

function _isDataEnabled(media) {
    console.log("_isDataEnabled");
    console.debug("isDataEnabled:", media);
    if(adapter.browserDetails.browser === "edge") {
        console.warn("Edge doesn't support data channels yet");
        return false;
    }
    if(media === undefined || media === null)
        return false;	// Default
    return (media.data === true);
}

function _isTrickleEnabled(trickle) {
    console.log("_isTrickleEnabled");
    console.debug("isTrickleEnabled:", trickle);
    return (trickle === false) ? false : true;
}

function _isExtensionEnabled() {
    console.log(_isExtensionEnabled = "_isExtensionEnabled(82)");
	if(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
		// No need for the extension, getDisplayMedia is supported
		return true;
	}
	if(window.navigator.userAgent.match('Chrome')) {
		var chromever = parseInt(window.navigator.userAgent.match(/Chrome\/(.*) /)[1], 10);
		var maxver = 33;
		if(window.navigator.userAgent.match('Linux'))
			maxver = 35;	// "known" crash in chrome 34 and 35 on linux
		if(chromever >= 26 && chromever <= maxver) {
			// Older versions of Chrome don't support this extension-based approach, so lie
			return true;
		}
        console.error("### CHECK - _isExtensionEnabled()");
		return _extension.isInstalled();
	} else {
		// Firefox and others, no need for the extension (but this doesn't mean it will work)
		return true;
	}
};
var _extension = {
	// Screensharing Chrome Extension ID
	extensionId: 'hapfgfdkleiggjjpfpenajgdnfckjpaj',
	isInstalled: function() { return document.querySelector('#janus-extension-installed') !== null; },
	getScreen: function (callback) {
		var pending = window.setTimeout(function () {
			var error = new Error('NavigatorUserMediaError');
			error.name = 'The required Chrome extension is not installed: click <a href="#">here</a> to install it. (NOTE: this will need you to refresh the page)';
			return callback(error);
		}, 1000);
		this.cache[pending] = callback;
		window.postMessage({ type: 'janusGetScreen', id: pending }, '*');
	},
	init: function () {
		var cache = {};
		this.cache = cache;
		// Wait for events from the Chrome Extension
		window.addEventListener('message', function (event) {
			if(event.origin != window.location.origin)
				return;
			if(event.data.type == 'janusGotScreen' && cache[event.data.id]) {
				var callback = cache[event.data.id];
				delete cache[event.data.id];

				if (event.data.sourceId === '') {
					// user canceled
					var error = new Error('NavigatorUserMediaError');
					error.name = 'You cancelled the request for permission, giving up...';
					callback(error);
				} else {
					callback(null, event.data.sourceId);
				}
			} else if (event.data.type == 'janusGetScreenPending') {
				//console.log('clearing ', event.data.id);
				window.clearTimeout(event.data.id);
			}
		});
	}
};

function btnChange(id, isEnable) {
    console.log("btnChange");
    if(isEnable) {
        $('#'+id).attr('style', 'background: #8585ff; cursor: pointer;');
    } else {
        $('#'+id).attr('style', 'background: rgba(200, 200, 200, 1); cursor: pointer;');
    }
}

function setConfigMenu() {
    console.log("setConfigMenu");
    $("#cfgBtn").unbind();
    $("#cfgBtn").click(function() {
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            var deviceId;
            var kind;
            var label;
            var groupId; //--- TODO: Audio Input/Output의 GroupID가 같지 않을 경우 에코가 발생할 수 있음(경고를 추가해야함)
            $('#audio_input *').remove();
            $('#video_input *').remove();
            $('#audio_output *').remove();
            for(var i=0;i<devices.length; i++) {
                deviceId = devices[i]["deviceId"];
                isDefault = deviceId === "default";
                kind = devices[i]["kind"];
                label = devices[i]["label"];
                groupId = devices[i]["groupId"];
                if(kind === "audioinput") {
                    $('#audio_input').append('<option value="' + deviceId + '"' + (isDefault?' selected="selected"':'') + '>' + label +'</option>');
                } else if(kind === "videoinput") {
                    $('#video_input').append('<option value="' + deviceId + '"' + (isDefault?' selected="selected"':'') + '>' + label +'</option>');
                } else if(kind === "audiooutput") {
                    $('#audio_output').append('<option value="' + deviceId + '"' + (isDefault?' selected="selected"':'') + '>' + label +'</option>');
                }
            }
        });
        $("#configModal").css("display", "block");
        initConfigForAudio();
    });
    $("#cfg_close_btn").unbind();
    $("#cfg_close_btn").click(function() {
        $("#configModal").css("display", "none");
    });
    $("#audio_cfg_btn").unbind();
    $("#audio_cfg_btn").click(initConfigForAudio);
    $("#video_cfg_btn").unbind();
    $("#video_cfg_btn").click(initConfigForVideo);

    $("#bitrate").unbind();
    $("#bitrate").change(function() {
        var id = $(this).val();
        changeBitrate(id);
    });

    $("#tx_res").unbind();
    $("#tx_res").change(function() {
        var value = $(this).val();
        //console.log("##### Resolution changed:", value);
        if(value === "720") {
            changeOwnFeedVideo("hdres");
        } else if(value === "360") {
            changeOwnFeedVideo("stdres-16:9");
        } else if(value === "180") {
            changeOwnFeedVideo("lowres-16:9");
        }
    });

    $("#audio_input").unbind();
    $("#audio_input").change(function() {
        var id = $(this).val();
        sfutest.createOffer(
            {
                media: {
                    audio: {
                        deviceId: id
                    },
                    replaceAudio: true
                },
                success: function(jsep) {
                    console.debug(jsep);
                    var data = { request: "media", cid: sfutest.getId(), audio: true, video: true, jsep: jsep };
                    var request = { type: "videoconf", data: data };
                    httpAPICall("/onsvc/videoconf/configure", {
                        verb: 'POST',
                        body: request,
                        success: function(json) {
                            console.debug(json);
                        },
                        error: function(textStatus, errorThrown) {
                            if(errorThrown === "")
                                bootbox.alert(textStatus + ": Is the server down?");
                            else {
                                bootbox.alert(textStatus + ": " + errorThrown);
                            }
                        }
                    });
                },
                error: function(error) {
                    bootbox.alert("WebRTC error... " + JSON.stringify(error));
                }
            });
    });
    $("#video_input").unbind();
    $("#video_input").change(function() {
        var id = $(this).val();
        sfutest.createOffer(
            {
                media: {
                    video: {
                        deviceId: id
                    },
                    replaceVideo: true
                },
                success: function(jsep) {
                    console.debug(jsep);
                    var data = { request: "media", cid: sfutest.getId(), audio: true, video: true, jsep: jsep };
                    var request = { type: "videoconf", data: data };
                    httpAPICall("/onsvc/videoconf/configure", {
                        verb: 'POST',
                        body: request,
                        success: function(json) {
                            console.debug(json);
                        },
                        error: function(textStatus, errorThrown) {
                            if(errorThrown === "")
                                bootbox.alert(textStatus + ": Is the server down?");
                            else {
                                bootbox.alert(textStatus + ": " + errorThrown);
                            }
                        }
                    });
                },
                error: function(error) {
                    bootbox.alert("WebRTC error... " + JSON.stringify(error));
                }
            });
    });
    $("#audio_output").unbind();
    $("#audio_output").change(function() {
        var id = $(this).val();
        var audioElement = document.querySelectorAll("video");
        for(var i=0; i<audioElement.length; i++) {
            if(audioElement[i].id !== "myvideo") {
                if (typeof audioElement[i].sinkId !== 'undefined') {
                    audioElement[i].setSinkId(id)
                        .then(function() {
                            //console.log('Success, audio output device attached: ' + id);
                        })
                        .catch(function(error) {
                            var errorMessage = error;
                            if (error.name === 'SecurityError') {
                                errorMessage = 'You need to use HTTPS for selecting audio output ' + 'device: ' + error;
                            }
                            console.error(errorMessage);
                        });
                } else {
                    console.warn('Browser does not support output device selection.');
                }
            }
        }
    });

    //--- Audio pitch slider
    if(audioPitchMode === null) {
        audioPitchMode = "normal";
    }
    if(audioPitchMode === "custom") {
        $("#audio_pitch").removeAttr("disabled");
        $("#audio_pitch").val(pitchVal);
        document.querySelector("#audio_pitch_value").innerHTML = pitchVal;
    } else {
        $("#audio_pitch").attr("disabled", true);
    }
    document.querySelector("#audio_pitch").removeEventListener('input', audioPitchSliderEventListener);
    document.querySelector("#audio_pitch").addEventListener('input', audioPitchSliderEventListener);
    //--- Audio pitch radio button
    var audioPitchRadioBtns = document.getElementsByName("change_voice");
    for (var i = 0; i < audioPitchRadioBtns.length; i++) {
        audioPitchRadioBtns[i].removeEventListener('change', audioPitchRadioEventListener);
        if(audioPitchRadioBtns[i].value === audioPitchMode) {
            audioPitchRadioBtns[i].checked = "checked";
        }
        audioPitchRadioBtns[i].addEventListener('change', audioPitchRadioEventListener);
    }

    //--- Video filter slider
    if(videoFilterMode === null) {
        videoFilterMode = "none";
    }
    if(videoFilterLevel === -1) {
        videoFilterLevel = 3;
    }
    //--- Video filter mode radio button
    var videoFilterModeRadioBtns = document.getElementsByName("video_filter");
    for (var i = 0; i < videoFilterModeRadioBtns.length; i++) {
        videoFilterModeRadioBtns[i].removeEventListener('change', videoFilterModeRadioEventListener);
        if(videoFilterModeRadioBtns[i].value === videoFilterMode) {
            videoFilterModeRadioBtns[i].checked = "checked";
        }
        videoFilterModeRadioBtns[i].addEventListener('change', videoFilterModeRadioEventListener);
    }
    if(videoFilterMode === "none") {
        $("#video_filter_slider").attr("disabled", true);
    } else {
        $("#video_filter_slider").removeAttr("disabled");
    }
    $("#video_filter_slider").val(videoFilterLevel);
    document.querySelector("#video_filter_slider_value").innerHTML = "Level " + videoFilterLevel;
    document.querySelector("#video_filter_slider").removeEventListener('input', videoFilterSliderEventListener);
    document.querySelector("#video_filter_slider").addEventListener('input', videoFilterSliderEventListener);

}

function audioPitchRadioEventListener() {
    console.log("audioPitchRadioEventListener");
    audioPitchMode = this.value;
    if(audioPitchMode == "custom") {
        $("#audio_pitch").removeAttr("disabled");
        pitchVal = parseFloat($("#audio_pitch").val());
        document.querySelector("#audio_pitch_value").innerHTML = pitchVal;
    } else {
        $("#audio_pitch").attr("disabled", true);
        if(audioPitchMode == "low") {
            pitchVal = -0.8;
        } else if(audioPitchMode == "normal") {
            pitchVal = 0.0;
        } else if(audioPitchMode == "high") {
            pitchVal = 0.8;
        } else {
            pitchVal = 0.0;
        }
    }
    pitchChangeEffect.setPitchOffset(pitchVal);
    //console.log("Set audio pitch:", audioPitchMode);
}

function audioPitchSliderEventListener(e) {
    console.log("audioPitchSliderEventListener");
    pitchVal = parseFloat(e.target.value);
    //console.log("Set audio pitch:", pitchVal);
    if(pitchChangeEffect !== null) {
        pitchChangeEffect.setPitchOffset(pitchVal);
        document.querySelector("#audio_pitch_value").innerHTML = pitchVal;
    }
}

function videoFilterModeRadioEventListener() {
    console.log("videoFilterModeRadioEventListener");
    videoFilterMode = this.value;
    if(videoFilterMode === "none") {
        $("#video_filter_slider").attr("disabled", true);
    } else {
        $("#video_filter_slider").removeAttr("disabled");
    }
    //console.log("Set video filter mode:", this.value);
}

function videoFilterSliderEventListener(e) {
    console.log(videoFilterSliderEventListener = "videoFilterSliderEventListener(88)");
    //console.log("Set voice filter level:", e.target.value);
    document.querySelector("#video_filter_slider_value").innerHTML = "Level " + e.target.value;
    videoFilterLevel = parseInt(e.target.value);
}

function addButtonMenu() {
    console.log("addButtonMenu");
    if(calleeId !== null) {
        $('#btm_menu *').remove();
        $('#btm_menu').append(
            '<div class="ctrl-menu" id="ctrl_menu">' +
                '<div class="ctrl-btn" id="mute" style="cursor: pointer;">' +
                    '<img src="img/mic.png" width="35" height="35" alt="" >' +
                '</div>' +
                '<div class="ctrl-btn" id="camera_dis" style="cursor: pointer;">' +
                    '<img src="img/video.png" width="35" height="35" alt="" >' +
                '</div>' +
                '<div class="ctrl-btn" id="exit_btn" style="cursor: pointer;">' +
                    '<img src="img/exit.png" width="35" height="35" alt="" >' +
                '</div>' +
            '</div>' +
                /*'<div class="dropup">' +
                    '<div class="dropbtn ctrl-btn" id="more" style="cursor: pointer;">' +
                        '<img src="../icon/more.png" width="25" height="25" alt="" >' +
                        '<div class="dropup-content">' +
                            //'<button class="menu-btn" id="full_screen_btn">전체화면</button>' +
                            //'<button class="menu-btn" id="cfgBtn">설정</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +*/
            //'<div class="side-ctrl-menu" id="side_ctrl_menu">' +
            '</div>');
    } else {
        if(roomOwner) {
            $('#btm_menu *').remove();
            $('#btm_menu').append(
                '<div class="ctrl-menu" id="ctrl_menu">' +
                    '<div class="ctrl-btn" id="mute" style="cursor: pointer;">' +
                        '<img src="img/mic.png" width="35" height="35" alt="" >' +
                    '</div>' +
                    '<div class="ctrl-btn" id="camera_dis" style="cursor: pointer;">' +
                        '<img src="img/video.png" width="35" height="35" alt="" >' +
                    '</div>' +
                    '<div class="ctrl-btn" id="screen_sharing" title="화면 공유" style="cursor: pointer;">' +
                        '<img src="img/screen.png" width="35" height="35" alt="" >' +
                    '</div>' +
                    '<div class="ctrl-btn" id="record" title="녹화" style="cursor: pointer;">' +
                        '<img src="img/record.png" width="35" height="35" alt="" >' +
                    '</div>' +
                    '<div class="dropup">' +
                        '<div class="dropbtn ctrl-btn" id="more" style="cursor: pointer;">' +
                            '<img src="img/more.png" width="35" height="35" alt="" >' +
                            '<div class="dropup-content">' +
                            //    '<button class="menu-btn" id="full_screen_btn">전체화면</button>' +
                            //    '<button class="menu-btn" id="cfgBtn">설정</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ctrl-btn" id="exit_btn" style="cursor: pointer; background: rgb(195,5,5);">' +
                        '<img src="img/exit.png" width="35" height="35" alt="" >' +
                    '</div>' +
                '</div>' +
                '<div class="side-ctrl-menu" id="side_ctrl_menu">' +
                    '<div class="ctrl-btn" id="room_info" style="cursor: pointer;">' +
                        '<img src="img/info.png" width="25" height="25" alt="" >' +
                    '</div>' +
                    '<div class="ctrl-btn" id="members_open_btn" style="cursor: pointer;">' +
                        '<img src="img/member.png" width="25" height="25" alt="" >' +
                    '</div>' +
                    '<div class="ctrl-btn" id="chat_open_btn" style="cursor: pointer;">' +
                        '<img src="img/chat.png" width="25" height="25" alt="" >' +
                    '</div>' +
                '</div>');
        } else {
            $('#btm_menu *').remove();
            $('#btm_menu').append(
                '<div class="ctrl-menu" id="ctrl_menu">' +
                    '<div class="ctrl-btn" id="mute" style="cursor: pointer;">' +
                        '<img src="img/mic.png" width="25" height="25" alt="" >' +
                    '</div>' +
                    '<div class="ctrl-btn" id="camera_dis" style="cursor: pointer;">' +
                        '<img src="img/video.png" width="25" height="25" alt="" >' +
                    '</div>' +
                    //--- 참여자는 화면공유 기능 사용X
                    // '<div class="ctrl-btn" id="screen_sharing" title="화면 공유" style="cursor: pointer;">' +
                    //     '<img src="../icon/screen.png" width="25" height="25" alt="" >' +
                    // '</div>' +
                    //--- 참여자는 녹화 기능 사용X
                    // '<div class="ctrl-btn" id="record" title="녹화" style="cursor: pointer;">' +
                    //     '<img src="../icon/record.png" width="25" height="25" alt="" >' +
                    // '</div>' +
                    /*'<div class="dropup">' +
                        '<div class="dropbtn ctrl-btn" id="more" style="cursor: pointer;">' +
                            '<img src="../icon/more.png" width="25" height="25" alt="" >' +
                            '<div class="dropup-content">' +
                                '<button class="menu-btn" id="full_screen_btn">전체화면</button>' +
                                '<button class="menu-btn" id="cfgBtn">설정</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    */
                    '<div class="ctrl-btn" id="exit_btn" style="cursor: pointer; <!-- background: rgb(195,5,5); -->">' +
                        '<img src="img/exit.png" width="35" height="35" alt="" >' +
                    '</div>' +
                '</div>' +
                '<div class="side-ctrl-menu" id="side_ctrl_menu">' +
                    //--- 참여자는 초대링크 기능 사용X
                    // '<div class="ctrl-btn" id="room_info" style="cursor: pointer;">' +
                    //     '<img src="../icon/info.png" width="25" height="25" alt="" >' +
                    // '</div>' +
                    '<div class="ctrl-btn" id="members_open_btn" style="cursor: pointer;">' +
                        '<img src="img/member.png" width="25" height="25" alt="" >' +
                    '</div>' +
                    '<div class="ctrl-btn" id="chat_open_btn" style="cursor: pointer;">' +
                        '<img src="img/chat.png" width="25" height="25" alt="" >' +
                    '</div>' +
                '</div>');
        }
        
    }
    setConfigMenu();
    addButtonEvent();
    addFullScreenEventListener();
    $("#full_screen_btn").click(changeFullScreenMode);
}

function addButtonEvent() {
    console.log("addButtonEvent");
    $("#mute").unbind();
    $("#mute").click(toggleMute);

    $("#camera_dis").unbind();
    $("#camera_dis").click(toogleVideoEnable);

    $("#screen_sharing").unbind();
    $("#screen_sharing").click(testSharing);

    $("#record").unbind();
    $("#record").click(testRecord);

    $("#exit_btn").unbind();
    $("#exit_btn").click(exit);

    $("#room_info").unbind();
    $("#room_info").click(getInviteCodeForRoomInfo);

    $("#members_open_btn").unbind();
    $("#members_open_btn").click(openMembers);

    $("#members_close_btn").unbind();
    $("#members_close_btn").click(closeMembers);

    $("#chat_open_btn").unbind();
    $("#chat_open_btn").click(openNav);

    $("#chat_close_btn").unbind();
    $("#chat_close_btn").click(closeNav);
    
    $("#datasend").unbind();
    $("#datasend").keypress(function(event) {
        return checkEnterForTextRoom(this, event);
    });
}

//----- For TextRoom
function checkEnterForTextRoom(field, event) {
    console.log("checkEnterForTextRoom");
	var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
	if(theCode == 13) {
        sendData();
		return false;
	} else {
		return true;
	}
}

// Helper method to create random identifiers (e.g., transaction)
function randomString(len) {
    console.log("randomString");
	var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz,randomPoz+1);
	}
	return randomString;
};

function sendData() {
    console.log("sendData");
	var data = $('#datasend').val();
	if(data === "") {
		bootbox.alert('Insert a message to send on the DataChannel');
		return;
	}
	var message = {
		textroom: "message",
		transaction: randomString(12),
		room: roomId,
 		text: data,
	};
	// Note: messages are always acknowledged by default. This means that you'll
	// always receive a confirmation back that the message has been received by the
	// server and forwarded to the recipients. If you do not want this to happen,
	// just add an ack:false property to the message above, and server won't send
	// you a response (meaning you just have to hope it succeeded).
	textroom.data({
		text: JSON.stringify(message),
		error: function(reason) { bootbox.alert(reason); },
		success: function() { $('#datasend').val(''); }
	});
}

// Private method to send a data channel message
function _sendData(channelId, callbacks) {
    console.log("_sendData");
    callbacks = callbacks || {};
    callbacks.success = (typeof callbacks.success == "function") ? callbacks.success : noop;
    callbacks.error = (typeof callbacks.error == "function") ? callbacks.error : noop;
    var cHandle = channels[channelId];
    if(!cHandle || !cHandle.webrtcStuff) {
        console.warn("Invalid handle");
        callbacks.error("Invalid handle");
        return;
    }
    var config = cHandle.webrtcStuff;
    var data = callbacks.text || callbacks.data;
    if(!data) {
        console.warn("Invalid data");
        callbacks.error("Invalid data");
        return;
    }
    var label = callbacks.label ? callbacks.label : "DataChannel";
    if(!config.dataChannel[label]) {
        // Create new data channel and wait for it to open
        _createDataChannel(channelId, label, callbacks.protocol, false, data, callbacks.protocol);
        callbacks.success();
        return;
    }
    if(config.dataChannel[label].readyState !== "open") {
        config.dataChannel[label].pending.push(data);
        callbacks.success();
        return;
    }
    //console.log("Sending data on data channel <" + label + ">");
    console.debug(data);
    config.dataChannel[label].send(data);
    callbacks.success();
}

function openNav() {
    console.log("openNav");
    document.getElementById("mySidenav").style.width = "350px";
}

function closeNav() {
    console.log("closeNav");
    document.getElementById("mySidenav").style.width = "0";
}

function openMembers() {
    console.log("openMembers");
    document.getElementById("side_member_list").style.width = "350px";
}

function closeMembers() {
    console.log("closeMembers");
    document.getElementById("side_member_list").style.width = "0";
}

function getInviteCodeForRoomInfo() {
    console.log("getInviteCodeForRoomInfo");
    copyInviteCode(roomId);
}

function getInviteCode(roomId) {
    console.log("getInviteCode");
    copyInviteCode(roomId);
}

function copyInviteCode(roomId) {
    console.log("copyInviteCode");
    var inviteCode = "https://onnetsystems.co.kr/onsvc/join?rid=" + roomId;
    bootbox.dialog({
        title: "회의방 초대 코드",
        message: "<form id='formId' action=''>\
                    <input type='text' id='inv_code' name='inv_code' value='" + inviteCode + "' style='width:400px;' readonly /><br/>\
                    <br/>\
                    'OK'버튼을 누르시면 초대 코드가 복사됩니다.<br>\
                </form>",
        buttons: {
            ok: {
                label: "OK",
                callback: function(result) {
                    if(result !== null) {
                        var linkText = document.getElementById("inv_code");
                        linkText.select();
                        linkText.setSelectionRange(0, 99999);
                        document.execCommand("copy");
                        alert("초대 링크가 복사됐습니다: " + linkText.value);
                    }
                }
            }
        }
    });
}

function initConfigForAudio() {
    console.log("initConfigForAudio");
    $("#audio_cfg_content").css("display", "block");
    $("#video_cfg_content").css("display", "none");
    $("#audio_cfg_btn").addClass("active");
    $("#video_cfg_btn").removeClass("active");
}

function initConfigForVideo() {
    console.log("initConfigForVideo");
    $("#audio_cfg_content").css("display", "none");
    $("#video_cfg_content").css("display", "block");
    $("#audio_cfg_btn").removeClass("active");
    $("#video_cfg_btn").addClass("active");
}

var isFullScreen = false;
function changeFullScreenMode() {
    console.log("changeFullScreenMode");
    if(isFullScreen) {
        stopFullScreen();
        $("#full_screen_btn").html("전체화면");
        isFullScreen = false;
    } else {
        startFullScreen();
        $("#full_screen_btn").html("전체화면 종료");
        isFullScreen = true;
    }
}

function startFullScreen() {
    console.log("startFullScreen");
    if(document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if(document.documentElement.webkitRequestFullscreen) {
        //--- Chrome, Safari (webkit)
        document.documentElement.webkitRequestFullscreen();
    } else if(document.documentElement.mozRequestFullScreen) {
        //--- Firefox
        document.documentElement.mozRequestFullScreen();
    } else if(document.documentElement.msRequestFullscreen) {
        //--- IE, Edge
        document.documentElement.msRequestFullscreen();
    }
}

function stopFullScreen() {
    console.log("stopFullScreen");
    if(document.exitFullscreen) {
        document.exitFullscreen();
    } else if(document.webkitExitFullscreen) {
        //--- Chrome, Safari (webkit)
        document.webkitExitFullscreen();
    } else if(document.mozCancelFullScreen) {
        //--- Firefox
        document.mozCancelFullScreen();
    } else if(document.msExitFullscreen) {
        //--- IE, Edge
        document.msExitFullscreen();
    }
}

function addFullScreenEventListener() {
    console.log("addFullScreenEventListener");
    document.addEventListener('fullscreenchange', updateFullScreenStatus);
    document.addEventListener('webkitfullscreenchange', updateFullScreenStatus);
    document.addEventListener('mozfullscreenchange', updateFullScreenStatus);
    document.addEventListener('MSFullscreenChange', updateFullScreenStatus);
}

function updateFullScreenStatus() {
    console.log("updateFullScreenStatus");
    if(!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement)  {
        $("#full_screen_btn").html("전체화면");
        isFullScreen = false;
    } else {
        $("#full_screen_btn").html("전체화면 종료");
        isFullScreen = true;
    }
}

function toggleMute() {
    console.log("toggleMute");
	var muted;
    if(calleeId !== null) {
        muted = videocall.isAudioMuted();
    } else {
        muted = sfutest.isAudioMuted();
    }
	console.debug((muted ? "Unmuting" : "Muting") + " local stream...");
    if(calleeId !== null) {
        if(muted)
            videocall.unmuteAudio();
        else
            videocall.muteAudio();
        muted = videocall.isAudioMuted();
    } else {
        if(muted)
            sfutest.unmuteAudio();
        else
            sfutest.muteAudio();
        muted = sfutest.isAudioMuted();
    }
    $('#mute').html(muted ?
        '<img src="img/mic_mute.png" width="35" height="35" alt="" >' :
        '<img src="img/mic.png" width="35" height="35" alt="" >');
    if(muted) {
        $('#mute').attr('style','background: transparent; cursor: pointer;');
    } else {
        $('#mute').attr('style','background: transparent; cursor: pointer;');
    }
}

function toogleVideoEnable() {
    console.log("toogleVideoEnable");
    var muted;
    if(calleeId !== null) {
        muted = videocall.isVideoMuted();
    } else {
        muted = sfutest.isVideoMuted();
    }
    console.debug((muted ? "Unmuting" : "Muting") + " local video stream...");
    if(calleeId !== null) {
        if(muted)
            videocall.unmuteVideo();
        else
            videocall.muteVideo();
        muted = videocall.isVideoMuted();
    } else {
        if(muted)
            sfutest.unmuteVideo();
        else
            sfutest.muteVideo();
        muted = sfutest.isVideoMuted();
    }
    /* 카메라 on/off */
    $('#camera_dis').html(muted ?
        '<img src="img/video_off.png" width="35" height="35" alt="" >' :
        '<img src="img/video.png" width="35" height="35" alt="" >');
    if(muted) {
        $('#camera_dis').attr('style','background: transparent; cursor: pointer;');
    } else {
        $('#camera_dis').attr('style','background: transparent; cursor: pointer;');
    }
}

function _isMuted(channelId, video) {
    console.log("_isMuted");
    var cHandle = channels[channelId];
    if(!cHandle || !cHandle.webrtcStuff) {
        console.warn("Invalid handle");
        return true;
    }
    var config = cHandle.webrtcStuff;
    if(!config.pc) {
        console.warn("Invalid PeerConnection");
        return true;
    }
    if(!config.myStream) {
        console.warn("Invalid local MediaStream");
        return true;
    }
    if(video) {
        // Check video track
        if(!config.myStream.getVideoTracks() || config.myStream.getVideoTracks().length === 0) {
            console.warn("No video track");
            return true;
        }
        return !config.myStream.getVideoTracks()[0].enabled;
    } else {
        // Check audio track
        if(!config.myStream.getAudioTracks() || config.myStream.getAudioTracks().length === 0) {
            console.warn("No audio track");
            return true;
        }
        return !config.myStream.getAudioTracks()[0].enabled;
    }
}

function _mute(channelId, video, mute) {
    console.log("_mute");
    var cHandle = channels[channelId];
    if(!cHandle || !cHandle.webrtcStuff) {
        console.warn("Invalid handle");
        return false;
    }
    var config = cHandle.webrtcStuff;
    if(!config.pc) {
        console.warn("Invalid PeerConnection");
        return false;
    }
    if(!config.myStream) {
        console.warn("Invalid local MediaStream");
        return false;
    }
    if(video) {
        // Mute/unmute video track
        if(!config.myStream.getVideoTracks() || config.myStream.getVideoTracks().length === 0) {
            console.warn("No video track");
            return false;
        }
        config.myStream.getVideoTracks()[0].enabled = !mute;
        return true;
    } else {
        // Mute/unmute audio track
        if(!config.myStream.getAudioTracks() || config.myStream.getAudioTracks().length === 0) {
            console.warn("No audio track");
            return false;
        }
        config.myStream.getAudioTracks()[0].enabled = !mute;
        return true;
    }
}

function changeBitrate(id) {
    console.log("changeBitrate");
    var bitrate = parseInt(id)*1000;
    if(bitrate === 0) {
        //console.log("Not limiting bandwidth via REMB");
    } else {
        //console.log("Capping bandwidth to " + bitrate + " via REMB");
    }
    var data = { request: 'bitrate', bitrate: bitrate };
    var request = { data };
    httpAPICall("/onsvc/configure", {
        verb: 'POST',
        body: request,
        success: function(json) {
            console.debug(json);
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
    return false;
}

//---temp
function changeScreenSharingBitrate(id) {
    console.log("changeScreenSharingBitrate");
    var bitrate = parseInt(id)*1000;
    var data = { request: "bitrate", cid: screentest.getId(), bitrate: bitrate };
    var request = { data: data };
    httpAPICall("/onsvc/videoconf/configure", {
        verb: 'POST',
        body: request,
        success: function(json) {
            console.debug(json);
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
}

function changeOwnFeedVideo(video) {
    console.log("changeOwnFeedVideo");
    if(calleeId !== null) {
        videocall.createOffer(
            {
                media: {
                    video: video,
                    replaceVideo: true
                },
                success: function(jsep) {
                   //console.log("Resolution changed to " + video);
                    console.debug("Got publisher SDP!", jsep);
                    var data = { userid: calleeId, jsep: jsep };
                    var request = { type: "videocall", data: data };
                    httpAPICall("/onsvc/videocall/set", {
                        verb: 'POST',
                        body: request,
                        success: function(json) {
                            console.debug(json);
                        },
                        error: function(textStatus, errorThrown) {
                            if(errorThrown === "")
                                bootbox.alert(textStatus + ": Is the server down?");
                            else {
                                bootbox.alert(textStatus + ": " + errorThrown);
                            }
                            calleeId = null;
                            calleeName = null;
                        }
                    });
                },
                error: function(error) {
                    bootbox.alert("WebRTC error... " + error.message);
                }
            });
    } else {
        sfutest.createOffer(
            {
                media: {
                    video: video,
                    replaceVideo: true
                },
                success: function(jsep) {
                    //console.log("Resolution changed to " + video);
                    console.debug("Got publisher SDP!", jsep);
                    var data = { request: "media", cid: sfutest.getId(), audio: true, video: true, jsep: jsep };
                    var request = { type: "videoconf", data: data };
                    httpAPICall("/onsvc/videoconf/configure", {
                        verb: 'POST',
                        body: request,
                        success: function(json) {
                            console.debug(json);
                        },
                        error: function(textStatus, errorThrown) {
                            if(errorThrown === "")
                                bootbox.alert(textStatus + ": Is the server down?");
                            else {
                                bootbox.alert(textStatus + ": " + errorThrown);
                            }
                        }
                    });
                },
                error: function(error) {
                    bootbox.alert("WebRTC error... " + error.message);
                }
            });
    }
}

function startRecording() {
    console.log("startRecording");
	if(recording)
		return;
	// Start a recording
	recording = true;
	playing = false;
	bootbox.prompt("녹화 데이터의 이름을 입력하세요.", function(result) {
        if(result === "") {
            bootbox.alert("녹화 데이터의 이름을 입력해야 합니다.");
            recording = false;
            btnChange("record", recording);
            return;
        }
		if(!result) {
			recording = false;
            btnChange("record", recording);
			return;
		}
		var fileName = result;
        
		recordplay.createOffer(
			{
				// By default, it's sendrecv for audio and video... no datachannels,
				// unless we've passed the query string argument to record those too
				media: { data: (recordData != null) },
				success: function(jsep) {
					console.debug("Got SDP!", jsep);
                    var data = { request: "start", file_name: fileName, jsep: jsep };
                    if(acodec)
                        data["audiocodec"] = acodec;
					if(vcodec)
                        data["videocodec"] = vcodec;
					// For the codecs that support them (VP9 and H.264) you can specify a codec
					// profile as well (e.g., ?vprofile=2 for VP9, or ?vprofile=42e01f for H.264)
					if(vprofile)
                        data["videoprofile"] = vprofile;
					// If we're going to send binary data, let's tell the plugin
					if(recordData === "binary")
                        data["textdata"] = false;
                    var request = { data: data };
                    httpAPICall("/onsvc/record", {
                        verb: 'POST',
                        body: request,
                        success: function(json) {
                            console.debug(json);
                            bootbox.alert("녹화가 시작되었습니다.");
                        },
                        error: function(textStatus, errorThrown) {
                            if(errorThrown === "")
                                bootbox.alert(textStatus + ": Is the server down?");
                            else {
                                bootbox.alert(textStatus + ": " + errorThrown);
                            }
                        }
                    });
                    btnChange("record", recording);
                    // bootbox.alert("녹화가 시작되었습니다.");
				},
				error: function(error) {
					console.error("WebRTC error...", error);
					bootbox.alert("WebRTC error... " + error.message);
					recordplay.hangup(); //--- Client에서 신경 쓸 필요 없음
                    //---
                    // stop();
				}
			});
	});
}

function stopRecording() {
    console.log("stopRecording");
	// Stop a recording/playout
	$('#stop').unbind('click');
    var data = { request: "stop" };
    var request = { data: data };
    httpAPICall("/onsvc/record", {
        verb: 'POST',
        body: request,
        success: function(json) {
            console.debug(json);
            btnChange("record", recording);
            bootbox.alert("녹화가 종료되었습니다.");
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
	recordplay.hangup(); //--- Client에서 신경 쓸 필요 없음
}

function testRecord() {
    console.log("testRecord");
    if(!recording) {
        //console.log("Recording start:");
        startRecording();
    } else {
        //console.log("Recording stop:");
        stopRecording();
    }
}
/*
function setupChatting() {
    console.log("setupChatting");
    var data = { request: "setup" };
    var request = { data: data };
    httpAPICall("/onsvc/text", {
        verb: 'POST',
        body: request,
        success: function(json) {
            console.debug(json);
        },
        error: function(textStatus, errorThrown) {
            if(errorThrown === "")
                bootbox.alert(textStatus + ": Is the server down?");
            else {
                bootbox.alert(textStatus + ": " + errorThrown);
            }
        }
    });
}
*/

function exit() {
    console.log("exit");
    if(calleeId !== null) {
        doHangup();
    } else {
        doHangupVideoConf();
    }
    initSelectMenu();
}

function initSelectMenu() {
    console.log("initSelectMenu");
    $("#tx_res").val("360").prop("selected", true);
    $("#bitrate").val("1024").prop("selected", true);
}

function addLocalFeedLayout() {
    console.log("addLocalFeedLayout");
    $('#members').append(
        '<div class="col-xs-3 user-video" id=local-video>' +
            '<div class="video-bg" id="videolocal">' +
                '<span class="user-name" id="myname"></span>' +
            '</div>' +
        '</div>');
    resizeMultiVideo();
}

function addRemoteFeedLayout(remoteFeed) {
    console.log("addRemoteFeedLayout");
    $('#members').append(
        '<div class="col-xs-3 user-video" id="r' + remoteFeed.rfindex + '">' +
            '<div class="video-bg" id="videoremote' + remoteFeed.rfindex + '">' +
                '<span class="user-name">' + remoteFeed.rfdisplay + '</span>' +
            '</div>' +
        '</div>');
    resizeMultiVideo();
}


/* 발신자 레이아웃 */
function addCallerLayout() {
    console.log("addCallerLayout");
    $('#videos').append(
        '<div class="video-call" id=video_call>' +
        '</div>'
    );
    $('#video_call').append(
        '<div class="caller-video" id=caller_video>' +
            '<div class="caller-video-bg" id="videolocal">' +
                //'<span class="user-name" id="myname"></span>' +
            '</div>' +
        '</div>');
    resizeMultiVideo();
}
/* 수신자 레이아웃 */
function addCalleeLayout() {
    console.log("addCalleeLayout");
    $('#video_call').append(
        '<div class="callee-video" id=callee_video>' +
            '<div class="callee-video-bg" id="videoremote">' +
               // '<span class="user-name">' + calleeName + '</span>' +
            '</div>' +
        '</div>');
    resizeMultiVideo();
}

var userListLoader;
function afterSessionCreationSuccess() {
    console.log("afterSessionCreationSuccess");
    // window.addEventListener('beforeunload', (event) => {
    //     // 기본 동작 방지
    //     event.preventDefault();
    //     // Chrome에서는 필요한 값
    //     event.returnValue = '';
    //     return;
    // });
    $('#details').remove();
    $('#dashboard').removeClass('hide').show();
    //$('#roomcontainer').hide();
    //$("#configModal").hide();
    getUserList();
    getConfRoomList()
}

function afterVideoRoomJoinSuccess() {
    console.log("afterVideoRoomJoinSuccess");
    $('#dashboard').hide();
    $('#logo').hide();
}

function afterTextRoomJoinSuccess() {
    console.log("afterTextRoomJoinSuccess");
    $('#roomjoin').hide();
    $('#textroom').removeClass('hide').show();
    $('#datasend').removeAttr('disabled');
}

function afterGetStreamEvent() {
    console.log("afterGetStreamEvent");
    $('#videojoin').hide();
    $('#videos').removeClass('hide').show();
    addButtonMenu();
    $('#btm_menu').removeClass('hide').show();
}

function unAfterGetStreamEvent() {
    console.log("unAfterGetStreamEvent");
    $('#videojoin').removeClass('hide').show();
    $('#videos').hide();
    $('#btm_menu').hide();
    $('#btm_menu *').remove();
}

function afterVideoCallStart() {
    console.log("afterVideoCallStart");
    $('#members').hide();
    $('#dashboard').hide();
    $('#logo').hide();
    /* 화상통화 연결 후 설정/회의방/채팅방 hide*/
    $('#roomcontainer').hide();
    $("#configModal").hide();
}

// VideoCall, VideoConf 종료 후 처리
function afterVideoCallEnd() {
    console.log("afterVideoCallEnd");
    calleeId = null;
    calleeName = null;
    //--- Clean audio pitch config
    audioPitchMode = null;
    pitchVal = 0.0;
    $("#audio_pitch").val(pitchVal);
    document.querySelector("#audio_pitch_value").innerHTML = pitchVal;
    //--- Clean video filter config
    videoFilterMode = null;
    videoFilterLevel = -1;
    //--- Init layout with dashboard
    $('#video_call').remove();
    $('#members').removeClass('hide').show();
    $('#dashboard').removeClass('hide').show();
    $('#logo').removeClass('hide').show();
    /* 영상통화 관련 로직 처리 후 종료됐을 때 roomcontainer, configModal show*/
    $('#roomcontainer').hide();
    $("#configModal").hide();
    closeNav();
    closeMembers();
    $('#joined_member *').remove();
    $('#chatroom *').remove();
    getUserList();
    unAfterGetStreamEvent();
}
