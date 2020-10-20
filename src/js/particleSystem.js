/* author: Andrew Burks */
"use strict";

/* Get or create the application global variable */
var App = App || {};

const ParticleSystem = function () {
    //making public to call from anywhere
    var plane, particleSystem;


    // setup the pointer to the scope 'this' variable
    const self = this;

    // data container
    self.data = [];

    // scene graph group for the particle system
    const sceneObject = new THREE.Group();


    // bounds of the data
    const bounds = {};

    //const mainColorPalette = ["#D7191C", "#2C7BB6", "#FFFFBF", "#ABD9E9", "#FDAE61"]
    //const mainColorPalette = ["#cad2c5", "#84a98c", "#52796f", "#354f52", "#2f3e46"]
    // const mainColorPalette = ["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"]
    const mainColorPalette = ["#001427", "#708d81", "#f4d58d", "#bf0603", "#8d0801"]

    self.drawContainment = function () {

        // get the radius and height based on the data bounds
        const radius = (bounds.maxX - bounds.minX) / 2.0 + 1;
        const height = (bounds.maxY - bounds.minY) + 1;

        // create a cylinder to contain the particle system
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
        const cylinder = new THREE.Mesh(geometry, material);

        // add the containment to the scene
        sceneObject.add(cylinder);
    };

    // creates the particle system
    self.createParticleSystem = function () {

        sceneObject.position.x = 0;
        sceneObject.position.y = -2;
        sceneObject.position.z = 0;

        var particleGeometry = new THREE.Geometry();

        var particleMaterial = new THREE.PointsMaterial({
            color: 'rgb(255, 255, 255)',
            size: 1,
            side: THREE.DoubleSide,
            sizeAttenuation: false,
            vertexColors: THREE.VertexColors,
        });


        self.data.forEach(p => {
            const vector = new THREE.Vector3(p.X, p.Y, p.Z);
            particleGeometry.vertices.push(vector);
            if (p.density >= 0 && p.density <= 0.09) {
                particleGeometry.colors.push(new THREE.Color(mainColorPalette[0]));
            }
            else if (p.density >= 0.09 && p.density <= 0.5) {
                particleGeometry.colors.push(new THREE.Color(mainColorPalette[1]));

            }
            else if (p.density > 0.5 && p.density <= 20) {
                particleGeometry.colors.push(new THREE.Color(mainColorPalette[2]));
            }
            else if (p.density > 20 && p.density <= 40) {
                particleGeometry.colors.push(new THREE.Color(mainColorPalette[3]));
            }
            else {
                particleGeometry.colors.push(new THREE.Color(mainColorPalette[4]));
            }
        });

        //create the particle system
        particleSystem = new THREE.Points(
            particleGeometry,
            particleMaterial
        )

        //naming the object to call from any where
        particleSystem.name = 'particleSystem'

        sceneObject.add(particleSystem);


    };

    self.createPlane = function () {

        // get the radius and height based on the data bounds
        const radius = (bounds.maxX - bounds.minX) / 2.0 + 1;
        const height = (bounds.maxY - bounds.minY) + 1;

        var planeGeometry = new THREE.PlaneGeometry(2 * radius, 1.25 * height);
        var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xe2eafc, side: THREE.DoubleSide });
        plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.geometry.translate(0, (bounds.maxY - bounds.minY) / 2, 0);


        plane.name = 'plane'
        sceneObject.add(plane);
    }
    self.scatterPlot = function (zAxis) {
        d3.select('.crossSection').select('svg').remove();
        var filteredData = self.data.filter(p => {
            return p.Z >= (zAxis - 0.02) && p.Z <= (zAxis + 0.02);
        });
        //console.log(filteredData);
        var margin = { top: 10, right: 30, bottom: 30, left: 60 },
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select(".crossSection")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var xScale = d3.scaleLinear()
            .domain([bounds.minX, bounds.maxX])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));

        var yScale = d3.scaleLinear()
            .domain(d3.extent(filteredData.map(p => p.Y)))
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(yScale));


        var colors = d3.scaleLinear()
            .domain([0, 0.09, 0.5, 20, 40, 357.19])
            .range(mainColorPalette);

        // Add dots
        var circles = svg.append('g')
            .selectAll("dots")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return xScale(d.X); })
            .attr("cy", function (d) { return yScale(d.Y); })
            .style("fill", function (d) { return colors(d.density) })
            .attr("r", 3);



    }

    // data loading function
    self.loadData = function (file) {

        // read the csv file
        d3.csv(file)
            // iterate over the rows of the csv file
            .row(function (d) {

                // get the min bounds
                bounds.minX = Math.min(bounds.minX || Infinity, d.Points0);
                bounds.minY = Math.min(bounds.minY || Infinity, d.Points1);
                bounds.minZ = Math.min(bounds.minZ || Infinity, d.Points2);

                // get the max bounds
                bounds.maxX = Math.max(bounds.maxX || -Infinity, d.Points0);
                bounds.maxY = Math.max(bounds.maxY || -Infinity, d.Points1);
                bounds.maxZ = Math.max(bounds.maxY || -Infinity, d.Points2);

                // add the element to the data collection
                self.data.push({
                    density: Number(d.concentration),
                    X: Number(d.Points0),
                    Y: Number(d.Points2),
                    Z: Number(d.Points1),

                });
            })
            // when done loading
            .get(function () {
                // create the particle system
                self.createParticleSystem();
                self.createPlane();
                d3.select('#reset').on('click', function () {
                    var planeName = sceneObject.getObjectByName('plane');
                    sceneObject.remove(planeName);
                    self.createParticleSystem();
                    self.createPlane();
                });
                d3.select('#moveBehindZ').on('click', function () {

                    // move plane slice behind
                    plane.translateZ(-0.05);
                    self.scatterPlot(plane.position.z);
                })
                d3.select('#moveBehindZFaster').on('click', function () {

                    // move plane slice behind
                    plane.translateZ(-0.5);
                    self.scatterPlot(plane.position.z);
                })
                d3.select('#moveAheadZ').on('click', function () {

                    // move plane slice forward
                    plane.translateZ(0.05);
                    self.scatterPlot(plane.position.z);
                })
                d3.select('#moveAheadZFaster').on('click', function () {

                    // move plane slice forward
                    plane.translateZ(0.5);
                    self.scatterPlot(plane.position.z);
                })
            });
    };

    // publicly available functions
    self.public = {

        // load the data and setup the system
        initialize: function (file) {
            self.loadData(file);
        },

        // accessor for the particle system
        getParticleSystems: function () {
            return sceneObject;
        }
    };

    return self.public;

};