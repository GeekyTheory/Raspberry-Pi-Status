Raspberry Pi Monitoring Panel
===================

This project consist on a Node.js-based Raspberry Pi monitoring panel that allows to check the temperature, memory status (free, cached, buffered, total...), the CPU load and the top tasks with their PID. 

This is a very useful web app for checking the status not only of a Raspberry Pi but also of a Linux computer.

# Author

This project has been developed by [Mario Pérez Esteso](http://github.com/marioperezesteso "Mario Pérez Esteso").

#### Contributors

* [Bernat Borrás Paronella](http://github.com/alorma "Bernat Borrás Paronella")

# Screenshot
![Raspberry Pi Monitoring Panel](http://i1.wp.com/geekytheory.com/wp-content/uploads/2013/12/panel-monitorizacion-raspberry-pi-node-js.png "Raspberry Pi Monitoring Panel")

# How to install

**STEP 1:**
~~~
$ sudo apt-get update && sudo apt-get upgrade
~~~
**STEP 2:**
~~~
$ sudo apt-get install nodejs npm git
~~~
**STEP 3:**
~~~
$ git clone https://github.com/GeekyTheory/Raspberry-Pi-Status.git
~~~
**STEP 4:**
~~~
$ cd Raspberry-Pi-Status
~~~
**STEP 5:**
~~~
$ npm install
~~~
If everything is OK, go to step 6. If it throws an error:
~~~
npm config set registry http://registry.npmjs.org/
~~~
~~~
npm install
~~~
**STEP 6:**
~~~
$ nodejs server.js
~~~
**STEP 7:**

Open a browser with your Raspberry Pi's IP and start to listen the port 8000. For example: [http://192.168.1.100:8000](http://192.168.1.100:8000)


# License
~~~~~~
Copyright 2014 GeekyTheory (Mario Pérez Esteso)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
~~~~~~~

# More info

For more details, please visit: [Geeky Theory](http://geekytheory.com/panel-de-monitorizacion-para-raspberry-pi-con-node-js/ "Geeky Theory")
