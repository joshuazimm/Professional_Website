const n = 624; // The length of the state array
const m = 397;
const w = 31; // word size in bits 
const r = 31;
const a = 0x9908B0DF;
const u = 11;
const d = 0xFFFFFFFF;
const s = 7;
const b = 0x9D2C5680;
const t = 15;
const c = 0xEFC60000;
const l = 18;
const f = 1812433253;

const INT32_MAX = 0x7FFFFFFF;
let lowerBound = 0;
let upperBound = 0;
let numNumbers = 0;
let duration = 0;

const MT = new Array(n); // The state array
let index = n + 1;

// Function to seed the generator
function seed_mt(seed) {
    index = n;
    MT[0] = seed;
    for (let i = 1; i < n; ++i) {
        MT[i] = (f * (MT[i - 1] ^ (MT[i - 1] >>> (w - 2))) + i) & ((1 << w) - 1);
    }
}

// Generate the next n values from the series x_i 
function twist() {
    for (let i = 0; i < n; ++i) {
        let x = (MT[i] & (1 << r)) | (MT[(i + 1) % n] & ((1 << r) - 1));
        let xA = x >>> 1;
        if (x % 2 !== 0) { // lowest bit of x is 1
            xA ^= a;
        }
        MT[i] = MT[(i + m) % n] ^ xA;
    }
    index = 0;
}

// Extract a tempered value based on MT[index]
// calling twist() every n numbers
function extract_number() {
    if (index >= n) {
        if (index > n) {
            throw new Error("Generator was never seeded");
        }
        twist();
    }

    let y = MT[index];
    y ^= ((y >>> u) & d);
    y ^= ((y << s) & b);
    y ^= ((y << t) & c);
    y ^= (y >>> l);

    ++index;
    return y & ((1 << w) - 1);
}

function create_number(range) {
    return (extract_number() % range);
}

export { create_number };
seed_mt(Date.now());

function main() {
    let j = 0;
    let range = upperBound - lowerBound + 1;
    const randomNumbers = [];

    const startTime = performance.now(); // Start measuring time
    while (j < numNumbers) {
        randomNumbers.push(create_number(range) + lowerBound);
        j++;
    }
    const endTime = performance.now(); // Stop measuring time
    duration = endTime - startTime;
}

function displayRandomNumbers() {
    lowerBound = parseInt(document.getElementById("lowerBound").value);
    upperBound = parseInt(document.getElementById("upperBound").value);
    numNumbers = Math.min(parseInt(document.getElementById("numNumbers").value), 10000000);

    if (isNaN(lowerBound) || isNaN(upperBound) || isNaN(numNumbers)) {
        alert("Please enter valid numeric values.");
        return;
    }

    if (lowerBound > upperBound) {
        alert("Error: Lower bound must be less than or equal to upper bound.");
        return;
    }

    if (lowerBound > INT32_MAX || upperBound > INT32_MAX) {
        alert("Error: Lower bound or upper bound exceeds INT32_MAX. Please stay below INT32_MAX.");
        return;
    }

    const range = upperBound - lowerBound + 1;
    const randomNumbers = [];

    for (let i = 0; i < Math.min(numNumbers, 5); i++) {
        randomNumbers.push(create_number(range) + lowerBound);
    }

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    const numbersText = randomNumbers.join(", ");
    const p = document.createElement("p");
    p.textContent = `${randomNumbers.length} of the ${numNumbers} numbers requested: ${numbersText}`;
    resultsDiv.appendChild(p);

    main();

    const timeParagraph = document.createElement("p");
    timeParagraph.textContent = `Generation time: ${duration.toFixed(2)} milliseconds`;
    resultsDiv.appendChild(timeParagraph);
}

document.getElementById("generateButton").addEventListener("click", displayRandomNumbers);