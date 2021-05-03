function test(obj) {
    var div1 = document.getElementById(obj);
    if(div1.style.display == "block") {
        div1.style.display = "none";
    } else {
        if(obj == 'RQ5-content') {
            document.getElementById("RQ5").style.marginTop = "200px";
            if(!dataRQ5) {
                dataRQ5 = d3.csv("data/PRSA_Data_20130301-20170228/human-factor.csv").then(d => RQ5(d));
            }
        } else if (obj == 'RQ4-content') {
            document.getElementById("RQ5").style.marginTop = "0";
            if(!dataRQ4) {
                dataRQ4 = d3.csv("data/PRSA_Data_20130301-20170228/air-quality-overall.csv").then(d => drawLines(d));
            }
        }
        div1.style.display = "block";
    }
    if(document.getElementById("RQ4-content").style.display == "block" && document.getElementById("RQ5-content").style.display == "block") {
        document.getElementById("RQ5").style.marginTop = "0";
    }
    if(document.getElementById("RQ4-content").style.display == "none" && document.getElementById("RQ5-content").style.display == "block") {
        document.getElementById("RQ5").style.marginTop = "200px";
    }
}

function highlight(obj) {
    var div1 = document.getElementById(obj);
    var setColor = "rgb(37, 189, 118)";
    var originColor = "rgba(37, 189, 118, 0.753)";
    if(div1.style.backgroundColor != setColor) {
        div1.style.backgroundColor = setColor;
    } else {
        div1.style.backgroundColor = originColor;
    }
}

var RQtitle4 = document.getElementById("RQ4-title");
var RQtitle5 = document.getElementById("RQ5-title");

RQtitle4.onmouseover = function() {
    highlight("RQ4-title");
}

RQtitle4.onmouseout = function() {
    highlight("RQ4-title");
}

RQtitle5.onmouseover = function() {
    highlight("RQ5-title");
}

RQtitle5.onmouseout = function() {
    highlight("RQ5-title");
}