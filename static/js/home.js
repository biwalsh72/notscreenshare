$(function(){
	// You can add Users inside JSON users section
	var _json = {
		users: ["Grain"],
		chats: [{
			from: 'Grain',
			msg: 'AHAHAHAHA ahahaha bitch.',
			time: '1533263925814',
			action: ''
		}]
	};
		
	init();
	function init () {
		renderData();
	};	
	
	// RENDER METHODS
	function renderData () {
		var _now = $.now();
		getDateTime(_now);
		_json.users.forEach(function (user) {
			var userID = user.replace(/ /g,"_");
			var parentString = '<div class="chatbox" id="'+userID+'">'+
				 '<div class="chats">'+
				 '<ul></ul>'+
				 '</div>'+
				 '<div class="sendBox">'+
				 '<input type="text" placeholder="Type here... ">'+
				 '</div>';	
			$('#viewport').append(parentString);
			_json.chats.forEach(function (chat) {
				var _cl;
				(chat.from === user) ? _cl = 'you' : _cl = 'him';
				var dataString = '<li>'+
					 '<div class="msg ' + _cl +'">'+
					 '<span class="partner">'+ chat.from +'</span>'+
					 chat.msg +
					 '<span class="time">' + getDateTime (chat.time) + '</span>'+
					 '</div></li>';
				$('#viewport #'+ userID +' .chats>ul').append(dataString);		
			});
		});		
	};
	
	function newMsgRender (data) {
		$('#viewport .chats ul>li.pending').remove();
		_json.users.forEach(function (user) {
			var checkID = user.replace(/ /g,"_");
			var _cl = '';
			(data.from === user) ? _cl = 'you' : _cl= 'him';					
			$('#viewport .chatbox#'+ checkID +' .chats ul')
				.append('<li><div class="msg '+_cl+'">'+
						  '<span class="partner">'+ data.from +'</span>'+
						  data.msg +
						  '<span class="time">' + getDateTime (data.time) + '</span>'+
						  '</div>'+
						  '</li>');	
		});
	}
	
	function pendingRender (typingUser) {
		var pending = '<li class="pending">'+
			 '<div class="msg load">'+
			 '<div class="dot"></div>'+
			 '<div class="dot"></div>'+
			 '<div class="dot"></div>'+
			 '</div>'+
			 '</li>';
		_json.users.forEach( function (user) {
			user = user.replace(/ /g,"_");
			if(user !== typingUser) {
				if(!($('#'+ user +' .chats ul>li').hasClass('pending')))
					$('#'+ user +' .chats ul').append(pending);
			}
		});		
	}
	
	// HELPER FUNCTION
	function getDateTime (t) {
		var month 	= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];	
		var d 		= new Date(t/1000),
			 month 	= (month[d.getMonth()]),
			 day 		= d.getDate().toString(),
			 hour 	= d.getHours().toString(),
			 min 		= d.getMinutes().toString();
		(day.length < 2) ? day = '0' + day : '';
		(hour.length < 2) ? hour = '0' + hour : '';
		(min.length < 2) ? min = '0' + min : '';		
		var res = ''+month+' '+day+' '+hour+ ':' + min;
		return res;
	}
	
	// KEYPRESS EVENTS HANDLER
	$('#viewport .sendBox>input').keypress(function( e ) {			
		var _id = $(this).closest('.chatbox').attr('id');
		pendingRender(_id);
		if(e.which == 13) {
			var msgFrom;
			_json.users.forEach(function (user) {
				if(user.replace(/ /g,"_") === _id)
					msgFrom = user;
			});
			var msg = $('#'+_id+' .sendBox>input').val();
			msg = msg.replace(/\"/g,'\\"');
			var t = $.now();
			$('#'+_id+' .sendBox>input').val('');
			if(msg.replace(/\s/g, '') !== ''){
				var temp = {
					from: msgFrom,
					msg: msg,
					time: t.toString(),
					action: ''
				}
				_json.chats.push(temp);
				console.log(_json);
				newMsgRender (temp);
			} else {
				$('#viewport .chats ul>li.pending').remove();
			}
		}
	});	
	
	// EVENT HANDLER
	$('#viewport .sendBox>input').focusout(function() {
		$('#viewport .chats ul>li.pending').remove();
	});
});


function get_xy(event, offset) {
    // function to get position of event on image
    if (event.pageX == null) {
        // for mobile
        var x = event.x - offset.left
        var y = event.y - offset.top;
    } else {
        // for pc
        var x = event.pageX - offset.left
        var y = event.pageY - offset.top;

    }
    return [x, y];
}

function mouse_event(screen, event, type) {
    var offset = screen.offset();
    var point = get_xy(event, offset);
    console.log(type);

    $.ajax({
        type: 'POST',
        url: "/mouse",
        data: {
            "type": type,
            "x": point[0],
            "y": point[1],
            "X": screen.width(),
            "Y": screen.height()
        },
        success: function (result) {}
    });
}

function keyboard_event(type) {
    console.log(type);
    $.ajax({
        type: 'POST',
        url: "/keyboard",
        data: {
            "type": type
        },
        success: function (result) {}
    });
}
$(document).ready(function () {
    $.Finger.doubleTapInterval = 2000;
    document.oncontextmenu = function () {
        return false;
    };

    $('#screen').on('doubletap dblclick', function (event) {
        var screen = $(this);
        mouse_event(screen, event, "dblclick");
    });
    $('#screen').on('tap', function (event) {
        var screen = $(this);
        mouse_event(screen, event, "click");
    });
    $('#screen').on('taphold contextmenu', function (event) {
        event.preventDefault();
        var screen = $(this);
        mouse_event(screen, event, "rightclick");
    });


    $('#text').click(function (event) {
        var text = document.getElementById('typeText').value;
        console.log(text);
        $.ajax({
            type: 'POST',
            url: "/keyboard",
            data: {
                "type": "text",
                "text": text
            },
            success: function (result) {}
        });
    });
    $('.keyboard').click(function (event) {
        keyboard_event(this.id);
    });
    $('html').on('keyup', function (event) {
        if (event.keyCode == 13) {
            $('#enter').click();
        } else if (event.keyCode == 8) {
            $('#backspace').click();
        } else if (event.keyCode == 37) {
            $('#left').click();
        } else if (event.keyCode == 38) {
            $('#up').click();
        } else if (event.keyCode == 39) {
            $('#right').click();
        } else if (event.keyCode == 40) {
            $('#down').click();
        }
    });

});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

