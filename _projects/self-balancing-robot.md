---
layout: page
title: Self Balancing Robot
description: A two-wheeled, self-balancing robot created using an Arduino and a MPU6050 gyroscope.
img: assets/img/sb-robot/robot.png
importance: 3
category: personal
giscus_comments: true
---

## Parts

- Arduino Uno Microcontroller
- MPU6050 Accelerometer and Gyroscope
- L298N Motor Driver
- 2 x 300 RPM motors with wheels, 9V
- 3 x $$1\,M\Omega\,$$ 10 turn potentiometers
- 9V battery and barrel jack clip with switch
- 6 x AA batteries and barrel jack case with switch
- Assorted Wires
- Female header pins
- Proto boards
- Materials for a frame

### Tools

- Soldering iron
- Screwdriver
- Drill and drill bits

## Building

Please review the schematic below before proceeding to the build directions.

<div class="text-center my-4">
    {%
        include figure.html
        path="assets/img/sb-robot/schematic.png"
        title="Robot schematic"
        alt="Robot schematic"
        caption="The schematic for the robot. Note that this includes ultrasonic sensors and a Bluetooth transmitter, which are optional features."
        class="img-fluid rounded z-depth-1"
        zoomable=true
    %}
</div>

### Directions

1. Get a protoboard, and solder three potentiometers (for PID tuning) and a 
   seven-pin header for the MPU6050 to it.
2. Using fully stripped wires, connect VCC on the MPU6050 and one side of each
   trim pot together.
3. Solder wires onto the protoboard for the trim pot outputs, the VCC line 
   created in the previous step, and GND, SCL, SDA, and INT on the MPU6050.
4. Attach the Arduino, protoboard, and L298N to the robot frame.
5. Connect the Arduino to the wires on the protoboard, following the schematic.
6. Using jumper wires, connect the Arduino to the L298N according to the
   schematic.
7. Connect the L298N to the motors.
8. Attach the battery cases to the robot frame. The 6 x AA case should be low
   to improve center of gravity.
9. Connect the 9V battery to the Arduino and the 6 x AA batteries to the motor
   controller.
10. Flash the firmware to the Arduino (see below).
11. Turn on the motor switch, then the Arduino switch, wait for the MPU6050 to
    calibrate, and let the robot go!
12. Tune PID constants as needed using the potentiometers to achieve stability.
    Adjust $$P$$ until the robot oscillates back and forth with relative stability,
    then adjust $$I$$ until the robot stops falling over, and finally adjust $$D\,$$ to
    dampen the oscillations.

<div class="row justify-content-sm-center mt-4">
    <div class="col-sm-auto mt-3 mt-md-0">
        {% 
            include figure.html 
            path="assets/img/sb-robot/protoboard.jpg"
            title="Protoboard after soldering" 
            class="img-fluid rounded z-depth-1" 
            zoomable=true
        %}
    </div>
    <div class="col-sm-auto mt-3 mt-md-0">
        {% 
            include figure.html
            path="assets/img/sb-robot/protoboard_wires.jpg"
            title="Protoboard with wires attached" 
            class="img-fluid rounded z-depth-1" 
            zoomable=true
        %}
    </div>
</div>
<div class="caption mb-4">
    The completed protoboard, viewed from the top and bottom.
</div>

## The Code

The code is all written in C++, and can be found [here](https://git.nikola.cx/self-balancing-robot).
At a high level, the code consists of two parts, a setup and a loop, than can
be imagined to work like this:
```c++
void setup();
void loop();

void main()
{
    setup();
    
    for (;;)
        loop();
}
```

Inside the setup function, we perform several actions:
1. Set up serial communication
2. Initialize the I2C bus.
3. Initialize the MPU6050 and set up its Digital Motion Processor (DMP), which
   gives us more accurate position data in simple Yaw/Pitch/Roll angles.
4. Catch and report any errors along the way.

Then, we just to the loop. If anything failed in the setup, we blink an LED to
signify our error, and do nothing. Otherwise, we perform the following actions:
1. Loop until DMP data is ready, during which we:
   1. Compute PID and update motor powers.
   2. Read new PID constants from the trim pots.
   3. Blink our LED.
   4. Check for new DMP data to exit the loop.
2. Now that our DMP data is ready (signified by an interrupt or check for new
   data), we reset our interrupt and make sure that we have received a packet
   from the DMP.
3. Then, we make sure our DMP communication buffer has not overflowed, because
   then we would be working on stale data.
4. Now, we read the latest DMP packet, and use it to compute a position 
   quaternion.
5. Using that quaternion, we compute gravity, and then Yaw/Pitch/Roll.
6. We save the Roll data, as that tells us the robot's angle from vertical, and
   loop again to update motor controls.

## Final result

<div class="text-center">
    {%
        include video.html 
        path="https://www.youtube.com/embed/_9ukTeZ6Cfo?si=VuDx-DslcLFurVTX" 
        caption="Video of the two-wheeled self-balancing robot driving around with no user input."
        title="Video of the two-wheeled self-balancing robot."
        alt="Video of the two-wheeled self-balancing robot."
        class="rounded z-depth-1"
    %}
</div>
