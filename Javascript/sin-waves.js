const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        function HSVtoRGB(h, s, v) {
            let i = Math.floor(h / 60) % 6;
            let f = (h / 60) - i;
            let p = v * (1 - s);
            let q = v * (1 - f * s);
            let t = v * (1 - (1 - f) * s);

            let r, g, b;
            switch (i) {
                case 0:
                    r = v;
                    g = t;
                    b = p;
                    break;
                case 1:
                    r = q;
                    g = v;
                    b = p;
                    break;
                case 2:
                    r = p;
                    g = v;
                    b = t;
                    break;
                case 3:
                    r = p;
                    g = q;
                    b = v;
                    break;
                case 4:
                    r = t;
                    g = p;
                    b = v;
                    break;
                case 5:
                    r = v;
                    g = p;
                    b = q;
                    break;
            }

            return {
                r: Math.floor(r * 255),
                g: Math.floor(g * 255),
                b: Math.floor(b * 255),
            };
        }

        function getColor(currentLength, maxLength) {
            const ratio = currentLength / maxLength;
            const hue = ratio * 20.0 + 55;
            const saturation = 1.0;
            const value = 0.4;

            return HSVtoRGB(hue, saturation, value);
        }

        class Node {
            constructor(point1, point2, count) {
                this.point1 = point1;
                this.point2 = point2;
                this.count = count;
                this.length = Math.sqrt(
                    Math.pow(point2[0] - point1[0], 2) +
                    Math.pow(point2[1] - point1[1], 2)
                );
                this.next = null;
            }
        }

        class LinkedList {
            constructor() {
                this.head = null;
            }

            insert(p1, p2, count) {
                const newNode = new Node(p1, p2, count);

                if (this.head === null) {
                    this.head = newNode;
                } else {
                    let current = this.head;
                    let previous = null;

                    while (current !== null) {
                        current.count--;

                        if (current.count < 1) {
                            this.deleteNode(current.point1, current.point2, current.count);
                        }

                        previous = current;
                        current = current.next;
                    }

                    if (previous) {
                        previous.next = newNode;
                    }
                }
            }

            deleteNode(p1, p2, count) {
                let current = this.head;
                let previous = null;

                while (current !== null) {
                    if (
                        current.point1[0] === p1[0] &&
                        current.point1[1] === p1[1] &&
                        current.point2[0] === p2[0] &&
                        current.point2[1] === p2[1] &&
                        current.count === count
                    ) {
                        if (previous === null) {
                            this.head = current.next;
                        } else {
                            previous.next = current.next;
                        }
                        return;
                    }

                    previous = current;
                    current = current.next;
                }
            }

            draw(scaleX, scaleY) {
                ctx.strokeStyle = "white";
                const maxLength = 0.005;

                let current = this.head;
                while (current !== null) {
                    const color = getColor(current.length, maxLength);
                    ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    ctx.beginPath();
                    ctx.moveTo(
                        current.point1[0] * scaleX + scaleX * 2,
                        current.point1[1] * scaleY + scaleY * 2
                    );
                    ctx.lineTo(
                        current.point2[0] * scaleX + scaleX * 2,
                        current.point2[1] * scaleY + scaleY * 2
                    );
                    ctx.stroke();
                    current = current.next;
                }
            }

            display() {
                let current = this.head;
                while (current !== null) {
                    console.log(
                        `Point 1: (${current.point1[0]}, ${current.point1[1]}), ` +
                        `Point 2: (${current.point2[0]}, ${current.point2[1]}), ` +
                        `Counter: ${current.count}, ` +
                        `Length: ${current.length}`
                    );
                    current = current.next;
                }
            }
        }

        class Particle {
            constructor(pos, radius) {
                this.pos = pos;
                this.radius = radius;
            }

            update(position) {
                this.pos = position;
            }

            getPosition() {
                return this.pos;
            }

            displayPosition() {
                console.log(`Position: (${this.pos[0]}, ${this.pos[1]})`);
            }
        }

        class Sin {
            constructor(particle, amplitudeX, frequencyX, phaseShiftX, amplitudeY, frequencyY, phaseShiftY) {
                this.particle = particle;
                this.amplitudeX = amplitudeX;
                this.frequencyX = frequencyX;
                this.phaseShiftX = phaseShiftX;
                this.amplitudeY = amplitudeY;
                this.frequencyY = frequencyY;
                this.phaseShiftY = phaseShiftY;
            }

            moveParticle(deltaTime) {
                const xPos = this.amplitudeX * Math.sin(this.frequencyX * deltaTime + this.phaseShiftX);
                const yPos = this.amplitudeY * Math.sin(this.frequencyY * deltaTime + this.phaseShiftY);
                this.particle.update([xPos, yPos]);
            }
        }

        const canvasWidthPercentage = 40;
        const canvasHeightPercentage = 20;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const canvasWidth = (canvasWidthPercentage / 100) * screenWidth;
        const canvasHeight = (canvasHeightPercentage / 100) * screenHeight;

        canvas.width = canvasWidth + 4;
        canvas.height = canvasHeight + 4;

        const scaleX = canvas.width / 4;
        const scaleY = canvas.height / 4;

        const length = 2000;
        let t = 0.0;
        const list = new LinkedList();
        const list2 = new LinkedList();
        const particle = new Particle([0.0, 0.0], 1.0);
        const particle2 = new Particle([0.0, 0.0], 1.0);
        const sinWave = new Sin(particle, 1.95, 0.4, -0.5, 1.95, 1.0, 0.0);
        const sinWave2 = new Sin(particle2, 1.95, 0.4, 0.5, 1.95, 1.0, 0.0);

        ctx.lineWidth = 3;
        let isFirstFrame = true;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const preMovePos = particle.getPosition();
            sinWave.moveParticle(t);
            const postMovePos = particle.getPosition();

            const preMovePos2 = particle2.getPosition();
            sinWave2.moveParticle(t);
            const postMovePos2 = particle2.getPosition();

            if (!isFirstFrame) {
                list.insert(preMovePos, postMovePos, length);
                list2.insert(preMovePos2, postMovePos2, length);
            }

            list.draw(scaleX, scaleY);
            list2.draw(scaleX, scaleY);

            t += 0.005;
            requestAnimationFrame(draw);
            isFirstFrame = false;
        }

        draw();