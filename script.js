document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generate-btn");
    const modeRadios = document.getElementsByName("mode");
    const vexflowOutput = document.getElementById("vexflow-output");
    const hintsOutput = document.getElementById("hints-output");
    const hintToggle = document.getElementById("hint-toggle");

    const VF = Vex.Flow;

    // Możliwe nuty i ich polskie nazwy w zależności od znaku przygodnego
    const polishNames = {
        "c": { "none": "C", "#": "Cis", "b": "Ces" },
        "d": { "none": "D", "#": "Dis", "b": "Des" },
        "e": { "none": "E", "#": "Eis", "b": "Es" },
        "f": { "none": "F", "#": "Fis", "b": "Fes" },
        "g": { "none": "G", "#": "Gis", "b": "Ges" },
        "a": { "none": "A", "#": "Ais", "b": "As" },
        "b": { "none": "H", "#": "His", "b": "B" } // W polskiej notacji czyste b to H, a z bemolem to B
    };

    const possibleNotesTreble = [
        { keys: ["a/3"], base: "a" }, { keys: ["b/3"], base: "b" }, 
        { keys: ["c/4"], base: "c" }, { keys: ["d/4"], base: "d" }, { keys: ["e/4"], base: "e" },
        { keys: ["f/4"], base: "f" }, { keys: ["g/4"], base: "g" }, { keys: ["a/4"], base: "a" },
        { keys: ["b/4"], base: "b" }, { keys: ["c/5"], base: "c" }, { keys: ["d/5"], base: "d" },
        { keys: ["e/5"], base: "e" }, { keys: ["f/5"], base: "f" }, { keys: ["g/5"], base: "g" },
        { keys: ["a/5"], base: "a" }, { keys: ["b/5"], base: "b" }, { keys: ["c/6"], base: "c" }
    ];

    const possibleNotesBass = [
        { keys: ["c/2"], base: "c" }, { keys: ["d/2"], base: "d" }, { keys: ["e/2"], base: "e" },
        { keys: ["f/2"], base: "f" }, { keys: ["g/2"], base: "g" }, { keys: ["a/2"], base: "a" },
        { keys: ["b/2"], base: "b" }, { keys: ["c/3"], base: "c" }, { keys: ["d/3"], base: "d" },
        { keys: ["e/3"], base: "e" }, { keys: ["f/3"], base: "f" }, { keys: ["g/3"], base: "g" },
        { keys: ["a/3"], base: "a" }, { keys: ["b/3"], base: "b" }, { keys: ["c/4"], base: "c" }
    ];

    // Opcje dla VexFlow
    const vexDurations = {
        "w": 4,   // cała nuta
        "h": 2,   // półnuta
        "q": 1,   // ćwierćnuta
        "8": 0.5, // ósemka
        "wd": 6,  // cała z kropką
        "hd": 3,  // półnuta z kropką
        "qd": 1.5, // ćwierćnuta z kropką
        "8d": 0.75 // ósemka z kropką
    };

    const rhythmSyllables = {
        "w": "Ta-a-a-a", "h": "Ta-a", "q": "Ta", "8": "Ti",
        "wd": "Ta-a-a-a-a-a", "hd": "Ta-a-a", "qd": "Ta-i", "8d": "Ti-i"
    };

    function getCombination(remaining, allowed) {
        if (remaining < 0.01) return []; // Floating point safe zero
        let shuffled = [...allowed].sort(() => Math.random() - 0.5);
        for (let dur of shuffled) {
            let val = vexDurations[dur];
            if (val <= remaining + 0.01) {
                let rest = getCombination(remaining - val, allowed);
                if (rest !== null) {
                    return [dur, ...rest];
                }
            }
        }
        return null;
    }

    function drawNotes() {
        // Czyszczenie
        vexflowOutput.innerHTML = "";
        hintsOutput.innerHTML = "";

        // Zbieranie zaznaczonych wartości rytmicznych
        const selectedValues = [];
        if (document.getElementById("val-w").checked) selectedValues.push("w");
        if (document.getElementById("val-h").checked) selectedValues.push("h");
        if (document.getElementById("val-q").checked) selectedValues.push("q");
        if (document.getElementById("val-8").checked) selectedValues.push("8");

        // Jeśli nic nie wybrano, wymuś chociaż ćwierćnuty
        if (selectedValues.length === 0) {
            selectedValues.push("q");
            document.getElementById("val-q").checked = true;
        }

        // Pobieranie opcji
        const timeSignature = document.getElementById("time-signature").value;
        const addAccidentals = document.getElementById("accidentals-toggle").checked;
        const useRests = document.getElementById("rests-toggle").checked;
        const useDots = document.getElementById("dots-toggle").checked;
        
        // Sprawdzenie trybu i klucza
        const selectedClef = document.getElementById("clef-treble").checked ? "treble" : "bass";
        const isSingle = document.getElementById("mode-single").checked;
        const isSequence = document.getElementById("mode-sequence").checked;
        const typeRhythm = document.getElementById("mode-rhythm").checked;

        const possibleNotes = selectedClef === "treble" ? possibleNotesTreble : possibleNotesBass;

        // Opcje dozwolonych nut z kropkami
        let allowedDurations = [...selectedValues];
        if (useDots) {
            selectedValues.forEach(val => {
                if (val !== "8") allowedDurations.push(val + "d"); // Dodajemy warianty z kropką (poza ósemką dla prostoty)
            });
        }

        // Ukrywanie/Pokazywanie metrum w zależności od trybu
        const metrumGroup = document.getElementById("metrum-group");
        if (isSingle) {
            metrumGroup.style.display = "none";
        } else {
            metrumGroup.style.display = "flex";
        }

        // Określenie docelowej liczby uderzeń (beats)
        let targetBeats = 4;
        if (timeSignature === "3/4") targetBeats = 3;
        else if (timeSignature === "2/4") targetBeats = 2;
        else if (timeSignature === "4/4" || timeSignature === "C") targetBeats = 4;
        
        let canvasWidth = isSingle ? 300 : 800; // szersze płótno
        let renderWidth = canvasWidth;

        // Utworzenie VexFlow Renderer
        const renderer = new VF.Renderer(vexflowOutput, VF.Renderer.Backends.SVG);
        renderer.resize(canvasWidth, 350); // Zwiększono wysokość płótna do 350, żeby długie laski nut i dolne linie dodane się nie ucinały
        const context = renderer.getContext();
        
        // Powiekszenie skali
        context.scale(1.8, 1.8); 
        renderWidth = renderWidth / 1.8;

        // Stworzenie pięciolinii (Stave)
        const stave = new VF.Stave(10, 80, renderWidth - 20); // Obniżone do 80, by wyrównać pięciolinię na środku wyższego płótna
        stave.addClef(selectedClef);
        
        if (!isSingle) {
            stave.addTimeSignature(timeSignature);
        }
        
        stave.setContext(context).draw();

        const notesToDraw = [];
        const hintsToDraw = [];

        // Algorytm losujący nuty dopasowane do metrum
        let durationsToDraw = [];
        
        if (isSingle) {
            let validValues = allowedDurations.filter(d => vexDurations[d] <= targetBeats);
            if (validValues.length === 0) validValues = ["q"]; // fallback
            durationsToDraw.push(validValues[Math.floor(Math.random() * validValues.length)]);
        } else {
            // Inteligentne wypełnianie taktu
            let combo = getCombination(targetBeats, allowedDurations);
            if (combo === null) {
                // Jeśli kombinacja nie była możliwa (np. tylko 1.5 dostępne a trzeba wypełnić 4)
                combo = getCombination(targetBeats, ["w", "h", "q", "8"]);
                if (combo === null) combo = ["q", "q", "q", "q"]; // absolutny fallback 4/4
            }
            durationsToDraw = combo;
        }

        for (let i = 0; i < durationsToDraw.length; i++) {
            const duration = durationsToDraw[i];
            const isRest = useRests && Math.random() < 0.25;
            const isDotted = duration.includes("d");
            
            // W trybie rytmicznym rysujemy nuty na f/4 (wiolinowy) lub d/3 (basowy)
            const noteDef = possibleNotes[Math.floor(Math.random() * possibleNotes.length)];
            let keys = noteDef.keys;
            if (typeRhythm) {
                keys = selectedClef === "treble" ? ["f/4"] : ["d/3"];
            }
            
            // Dla VexFlow pauza to np. 'qr', 'qdr'
            const vexDurationStr = isRest ? duration + "r" : duration;

            const staveNote = new VF.StaveNote({
                clef: selectedClef,
                keys: keys,
                duration: vexDurationStr
            });

            if (isDotted) {
                VF.Dot.buildAndAttach([staveNote], { all: true });
            }

            let accidental = "none";
            if (!typeRhythm && !isRest && addAccidentals) {
                const rand = Math.random();
                if (rand < 0.25) accidental = "#";
                else if (rand < 0.5) accidental = "b";
                
                if (accidental !== "none") {
                    staveNote.addModifier(new VF.Accidental(accidental));
                }
            }

            notesToDraw.push(staveNote);

            // Podpowiedzi
            if (isRest) {
                hintsToDraw.push("Sza!");
            } else if (typeRhythm) {
                hintsToDraw.push(rhythmSyllables[duration] || "Ta");
            } else {
                // Dodanie numeru oktawy do podpowiedzi, np. C2, C1 - opcjonalne, na razie same nazwy
                hintsToDraw.push(polishNames[noteDef.base][accidental]);
            }
        }

        const beams = VF.Beam.generateBeams(notesToDraw);

        // Tworzenie głosu z restrykcyjnym sprawdzaniem
        const totalVoiceBeats = durationsToDraw.reduce((sum, d) => sum + vexDurations[d], 0);
        const voice = new VF.Voice({ num_beats: Math.round(totalVoiceBeats * 2) / 2, beat_value: 4 });
        voice.setStrict(true); 
        voice.addTickables(notesToDraw);

        new VF.Formatter().joinVoices([voice]).format([voice], renderWidth - 80);
        voice.draw(context, stave);
        beams.forEach(b => b.setContext(context).draw());

        // Generowanie podpowiedzi
        hintsToDraw.forEach(hint => {
            const hintEl = document.createElement("div");
            hintEl.className = "hint-box";
            hintEl.textContent = hint;
            hintsOutput.appendChild(hintEl);
        });
    }

    function updateHintsVisibility() {
        if (hintToggle.checked) {
            hintsOutput.classList.remove("hidden");
        } else {
            hintsOutput.classList.add("hidden");
        }
    }

    generateBtn.addEventListener("click", drawNotes);
    hintToggle.addEventListener("change", updateHintsVisibility);
    
    modeRadios.forEach(radio => {
        radio.addEventListener("change", drawNotes);
    });

    // Początkowe rysowanie i stan
    updateHintsVisibility();
    drawNotes();
});
