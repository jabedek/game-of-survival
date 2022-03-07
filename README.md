# GameOfSurvival
#
**Project of a game based on 'Game of Life' with some variations and additional features like non-moving units and broods (4-units groups). Currently, this project consists of builder mode and simple simulator.** 

You can watch all sorts of interesting data on a right panel while everything moves. On the same panel are couple of buttons to aid simulation/building actions.

Also, you can interact with field/unit by clicking on it and changing it's state. List of available actions:

Circular actions:
- single click on empty field will set it to unit with type 'obsticle'
- single click on an obsticle wil set it to unit with type 'particle'
- single click on a particle wil set it to unit with type 'other'
- single click on other unit wil set it to empty field

Other actions:
- drag will move unit if it's moveable and field is reachable and accessible for the unit 
- right slick will spawn unit broods, with a base of 4 units and then the brood will grow 


General focus in this work is on creating algorithms allowing to simulate interesting behaviors and on learning ngrx/store arch and how to optimize UI / browser responsiveness (in process).

Not all buttons on the panel work correctly yet.
#


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.1.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
