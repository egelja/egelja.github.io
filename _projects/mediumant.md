---
layout: page
title: MediumANT
description: A six-legged, walking robot, created using servos and Pololu Wixels.
img: assets/img/mediumant.jpg
importance: 2
category: personal
giscus_comments: true
---

## Cockroaches don't need wheels!

<div class="row justify-content-sm-center">
    <div class="col-sm-7 mt-3 mt-md-0">
        <p>
            While wheels are an efficient method of transportation, animals such as 
            cockroaches and cheetahs can move as fast or faster than a similarly-sized 
            wheeled vehicle, while also having more mobility over different types of 
            terrain.
        </p>
        <p>
            With this inspiration, I partnered with Dr. Shai Revzen of the UMich BIRDS Lab
            to create a six-legged foam core ant-like robot, MediumANT. While not as fast
            as a wheeled robot due to its simple construction, MediumANT is able to cross
            bumpy and rough terrain that a wheeled robot could not.
        </p>
    </div>
    <div class="col-sm-5 mt-3 mt-md-0">
        {% 
            include figure.html 
            path="assets/img/mediumant.jpg" 
            title="MediumANT robot" 
            alt="MediumANT robot" 
            caption="The completed MediumANT robot, walking around on its own power."
            class="img-fluid rounded z-depth-1"
            zoomable=true
        %}
    </div>
</div>

## Design

### The Legs

MediumANT’s legs are shaped so that, when first coming into contact with the
ground, the majority of the bottom surface (the right part of the top white 
foam) is in contact with the ground, providing the most traction. 

The legs are attached to the robot using a hinge, and to the motors
using the clear plastic offsets, which have the bottom attached to the motor 
and an axle through the top going to the hole in the leg. 

This hinge-offset combination allows the leg to pivot and grab the ground, then
lift the robot of the ground while walking.

<div class="row text-center row-eq-height">
    <div class="col-sm mt-3 mt-md-0">
        {% 
            include figure.html 
            path="assets/img/mediumant/legs.png" 
            title="MediumANT leg assembly" 
            alt="MediumANT leg assembly" 
            caption="The leg assembly for the MediumANT robot."
            class="img-fluid rounded z-depth-1"
            zoomable=true
        %}
    </div>
    <div class="col-sm mt-3 mt-md-0">
        {% 
            include figure.html 
            path="assets/img/mediumant/hinge.png" 
            title="MediumANT hinges"
            alt="MediumANT hinges"
            caption="The hinges for the MediumANT's legs."
            class="img-fluid rounded z-depth-1"
            style="max-height: 209px;"
            zoomable=true
        %}
    </div>
</div>

### The Body

The body is made up of a bottom, top, three supporting ridges, and several 
walls. 

The lengthwise walls come in two pairs are responsible for holding the rear 
and front servos, along with supporting the top.

An additional box that forms two lengthwise walls for the center servos and 
two width-wise walls for holding the battery pack is inserted in the middle. 

All the walls also help support the top, which holds the electronics on four
screw standoffs.

<div class="text-center my-4">
    {%
        include figure.html
        path="assets/img/mediumant/body.jpg"
        title="MediumANT body"
        alt="MediumANT body"
        caption="The assembly body of MediumANT, with legs."
        class="img-fluid rounded z-depth-1"
        zoomable=true
    %}
</div>

### The Electronics

The robot is controlled by a pair of Pololu Wixel microcontrollers, a Pololu
Micro Maestro servo controller, and six Parallax High-Speed Continuous Rotation
Servos.

The Wixel (chip on right) reads the positions of the legs from a special motor
signal line that first passes through a RC filter to clean the signal. It uses
the signal to set the motor positions, and tells the second Wixel connected to
the computer when it is ready. 

The computer Wixel then provides the next set of motor positions and polls 
until the robot Wixel is ready again. 

The robot Wixel sends servo commands to the Micro Maestro (bottom left) over a
UART line to move the servos to the proper positions. 

This cycle continues to allow the robot to walk like an ant.

<div class="text-center my-4">
    {%
        include figure.html
        path="assets/img/mediumant/electronics.png"
        title="MediumANT electronics"
        alt="MediumANT electronics"
        caption="The electronics controlling MediumANT."
        class="img-fluid rounded z-depth-1"
        zoomable=true
    %}
</div>

### The Code

All the code for this project was written in C11 and compiled by the Small 
Device C Compiler (SDCC) to Intel MCS-51 assembly. A set of one-byte commands
was used to communicate between the two Wixels, where a *command byte* had its
MSB set, and *data bytes* did not. This simplified programming, as errors could
be easily caught, as there would be leftover data bytes or an unexpected 
command byte. The Wixels could take variable-length commands, simply by
specifying a length parameter as the first data argument.

This command processing allowed a "division of labor" between the two Wixels.
The robot Wixel simply had to worry about moving the servos, it didn't have to
plan out a movement pattern. And the computer Wixel could have its movement
pattern easily updated, without having to worry about how the servos were 
moved.

## Final result

<div class="text-center my-2">
    {%
        include video.html 
        path="https://www.youtube.com/embed/VY8prr2lV9A?si=fKjnZixwrg-JiNjb"
        caption="Video of MediumANT walking with no user input."
        title="Video of MediumANT walking."
        alt="Video of MediumANT walking."
        class="rounded z-depth-1"
    %}
</div>

