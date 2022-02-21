/***************************************************/
/* 현재시간 받아오는 jquery*/
/***************************************************/
function showClock(){
    var currentDate = new Date();
    var divClock = document.getElementById('divClock');
    var msg = "현재 시간 : ";
    if(currentDate.getHours()>12){      //시간이 12보다 크다면 오후 아니면 오전
      msg += "PM ";
      msg += currentDate.getHours()-12+"시 ";
   }
   else {
     msg += "AM ";
     msg += currentDate.getHours()+"시 ";
   }

    msg += currentDate.getMinutes()+"분 ";
    msg += currentDate.getSeconds()+"초";

    divClock.innerText = msg;

    if (currentDate.getMinutes()>58) {    //정각 1분전부터 빨강색으로 출력
      divClock.style.color="white";
    }
    setTimeout(showClock,1000);  //1초마다 갱신
  }
/***************************************************/ 

/***************************************************/ 
/* mic 버튼 */
/***************************************************/
function mic_OnOff(){
  var mic_ = document.getElementById("mic_onoff");
  mic_.addEventListener("click", function(){
      alert("mic button test");
  });
}
/***************************************************/


/***************************************************/
/* video 버튼 */
/***************************************************/
function video_OnOff(){
    var video_ = document.getElementById("video_onoff");
    video_.addEventListener("click", function(){
        alert("video button test");
    });
  }
/***************************************************/
  

/***************************************************/
/* exit 버튼 */
/***************************************************/
  function exit_OK(){
    var exit_ = document.getElementById("exit");
    exit_.addEventListener("click", function(){
        alert("exit button test");
    });
  }
  /***************************************************/
