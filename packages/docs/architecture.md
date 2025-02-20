# Architecture

## Overview

The goal of `grid-wolf` is to provide participants in table-top role playing games (TTRPG) with
a way to visualize and track game scenarios in real-time over the internet. The application
emphasizes the following aspects:

- **Accessibility**: Software is *perceivable* through various senses, *operable* with assistive
technologies, *understandable* via clear instructions, information sets and navigation, and
*robustly* compatible with different devices and browsers.
- **Performance**: Systems respond quickly to user inputs even under high application loads,
leverage strategies to ensure usability in circumstances with poor network connectivity, and are
highly-tested to ensure reliability.
- **Ease-of-Use**: Interfaces are intuitive and flexible, requiring minimum user inputs to achieve
desired goals.
- **Availability**: Architecture relies on modern cloud-based technologies to maximize reliability,
provide redundancy, and eliminate maintenance down-times.
- **Maintainability**: Application components feature built-in metrics and alarms, are discrete and
of minimal complexity, and manual interventions are nearly eliminated.

The application is broken into a collection of related microservices, all of which are maintained
within this monorepo:

- [central-infra](../central-infra/) Manages "central infrastructure", resources that are leveraged
by multiple microservices within the application, including a shared DynamoDB table and EventBridge
event bus
- [shared](../shared/) Utility code and shared resources used by multiple microservices
- [user](../user/) Infrastrucutre and code allowing for user account creation, authentication and
management of game participants
- [game](../game/) Infrastructure and code related to creation of *Games*, the cohesive
central data structure of the application
- [map](../map/) Infrastructure and code related to the creation and management of *Maps*, which
provide a visual guide to gameplay
- [entity](../entity) Infrastructure and code for managing gameplay characters, enemies and other
non-player characters
- [session](../session) Resources for live online gameplay with your friends!

`grid-wolf` features a double-layer pattern for data flow. One flow provides external
communication via REST APIs and makes direct calls between resources within a single microservices.
A second flow is event-based and allows communication between microservices within AWS, but
provides no public-facing APIs.  Note in the image below that REST API handlers can publish events
to the central event bus, but events are only processed by event handlers in each microservice.

<center>
    <img alt='Internal and external data flows'
        src='./assets/app-data-flow.drawio.svg'
        width='700px'>
</center>

### Scenarios

1. 

## User Actions

<center>
    <img alt='Actors, actions & data items'
        src='./assets/user-actions.drawio.svg'
        width='960px'>
</center>

## User Journeys

*User journeys* describe the sequence of steps a user takes to accomplish a high-level goal within
the application.  These steps are oriented around a particular scenario, and do not provide
in-depth details on how each step is accomplished.

&nbsp;
<center>
    <img alt='Gamemaster journey'
        src='./assets/gm-journey.drawio.svg'
        width='960px'>

*Gamemaster journey: Game creation and successful session execution*
</center>

&nbsp;
&nbsp;
&nbsp;
<center>
    <img alt='Player journey'
        src='./assets/player-journey.drawio.svg'
        width='960px'>

*Player journey: Joining and participating in a successful gaming session*
</center>

## High Level System Design

<center>
    <img alt='Actors, actions & data items'
        src='./assets/high-level-system.drawio.svg'
        width='960px'>
</center>

Each application component consists of a distinct micro-app included in this repository.  For details on the function of each micro-app, refer to the documentation available in each package:

- [game](../game/README.md)
