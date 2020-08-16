# DeCoding-COVID-19
Website using computer simulations to raise awareness on the importance of social distancing \
Simulations were created using cellular automata, a discrete computational system
Cellular automata from *The Nature Of Code* by Daniel Shiffman: https://natureofcode.com/book/chapter-7-cellular-automata/ \
This website uses p5.js, a JavaScript library for creative coding: https://p5js.org/

### Simulation specifications

The simulation starts with a grid of 40 rows and 40 columns. Approximately 25% of the cells have people in them. As mentioned earlier, any cell can have an infected person (red), uninfected person (green), or can have no person (black). The cell's neighbours will be defined as the cells on the top, right, bottom, and left of the cell itself.

### Infection

If an unifected person has neighbours which are infected, then the uninfected person has a 75% chance to become infected.
The number 75% is accurate because the COVID-19 is estimated to spread at a rate such that for every person infected, an average of three more people get infected (estimated average R-nought value is three). Since there are four spaces the virus can move to, the transmission rate is effectively 75%. For the MERS, the chance of infection 12.5% since the average R-nought value is estimated to be 0.5.

### Movement

If there is no social distancing: \
If a person can move (i.e. the person does not have four neighbouring people), then it has a 50% chance of moving. \
If a person moves, then it randomly chooses a neighbouring cell where a person is not present and moves there. \
50% is an accurate estimate since (on average) half the family members move out of their homes in the open at any point in time. \
If there is social distancing: \
If a person has 0 neighbours, it does not move. \
If a person has 1 neighbour and is infected, the person moves. \
If a person has 1 neighbour and is not infected, it does not move. \
If a person has 2 or 3 neighbours, it moves. \
If a person has 4 neighbours, it does not move. (beacause it cannot). \
These rules ensure a person moves as far as possible other people, especially if the person is currently infected.

### Recovery

Recovery will be defined according to whether a person is a critical case or not. An infected person has a 5% chance to be a critical case. \
If a person is critical case, the person recovers in 32 days. \
If the person is not a critical case, 14 multiplied by a random number between 0 and 2 determines the recovery time. \
14 days is the average recovery rate for mild cases. Usually, recovery times can take a range of values. Hence the random number system was used.

### Credits

Idea of simulation inspired by 3Blue1Brown's great video on simulating an epidemic\
My brother Jay Jimulia for adding captivating titles, proverbs and meticulous layout, formatting.\
My parents for layouts, testing, and uploading the site.

### Sources for real-world data

Recovery data: WHO COVID-19 Report: https://www.who.int/docs/default-source/coronaviruse/who-china-joint-mission-on-covid-19-final-report.pdf \
Estmated R-nought for MERS: "The role of superspreading in Middle East respiratory syndrome coronavirus (MERS-CoV) transmission" by Eurosurveillance (2015) \
Estimated R-nought for the COVID-19: https://idpjournal.biomedcentral.com/articles/10.1186/s40249-020-00640-3 
