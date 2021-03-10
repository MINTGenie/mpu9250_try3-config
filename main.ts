basic.showNumber(8)
serial.writeValue("WHO_AM_I", orientbit.getident())
basic.forever(function () {
    serial.writeValue("X", orientbit.getGyroX())
    serial.writeValue("Y", orientbit.getGyroY())
    serial.writeValue("Z", orientbit.getGyroZ())
    basic.pause(100)
})
