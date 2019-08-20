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