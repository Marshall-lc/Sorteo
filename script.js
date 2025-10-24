document.addEventListener('DOMContentLoaded', () => {
    let participants = [];
    let currentAngle = 0;
    let isSpinning = false;

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const spinButton = document.getElementById("btnGirar");
    const winnerDisplay = document.getElementById("ganador");
    const actionsDisplay = document.getElementById("acciones");
    const continueButton = document.getElementById("btnSeguir");
    const endButton = document.getElementById("btnTerminar");
    const controlsDisplay = document.getElementById("controles");


// Cargar y parsear el archivo CSV
Papa.parse("Respuestas_de_formulario.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
        // CORRECCIÓN CLAVE: Obtener los nombres de las columnas (fields) y eliminar los espacios en blanco
        const cleanedFields = results.meta.fields.map(field => field.trim());
        
        participants = results.data.map(row => {
            // Acceder a los datos usando los nombres de columna correctos (sin espacios)
            
            // Usamos una función auxiliar para obtener el valor del campo
            const getFieldValue = (fieldName) => {
                const index = cleanedFields.indexOf(fieldName);
                if (index !== -1) {
                    // Accedemos a la data por el nombre de columna original (con espacios)
                    const originalFieldName = results.meta.fields[index];
                    return (row[originalFieldName] || '').trim();
                }
                return '';
            };

            const nombre = getFieldValue('Nombre');
            const apellido = getFieldValue('Apellido');
            // La columna del país ahora se busca como 'País' limpio
            const pais = getFieldValue('País'); 

            // Construir la cadena de identificación del participante
            let fullIdentifier = nombre;
            if (apellido) {
                fullIdentifier += ' ' + apellido;
            }
            // MODIFICACIÓN: Ahora el país debería aparecer
            if (pais) {
                fullIdentifier += ` (${pais})`;
            }

            return fullIdentifier;

        }).filter(name => name); // Filtrar si la cadena de identificación está vacía

        if (participants.length > 0) {
            drawRoulette();
        } else {
            console.error("No se encontraron participantes válidos en el CSV.");
        }
    }
});

    const drawRoulette = () => {
        const numSegments = participants.length;
        if (numSegments === 0) return;

        const anglePerSegment = (2 * Math.PI) / numSegments;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(currentAngle);

        for (let i = 0; i < numSegments; i++) {
            const segmentAngle = i * anglePerSegment;
            // Estilo de los segmentos
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, canvas.width / 2 - 5, segmentAngle, segmentAngle + anglePerSegment);
            ctx.closePath();
            // Colores alternos con gradiente
            const gradient = ctx.createRadialGradient(0, 0, 50, 0, 0, 250);
            if (i % 2 === 0) {
            ctx.fillStyle = '#facc15'; // Amarillo
        } else {
            ctx.fillStyle = '#fbbf24'; // Ámbar
        }
            ctx.fill();
            ctx.stroke();

            // Dibujar el texto
            ctx.save();
            ctx.rotate(segmentAngle + anglePerSegment / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#1e293b"; // Azul oscuro para texto
            ctx.font = "bold 14px Roboto";
            ctx.fillText(participants[i], canvas.width / 2 - 20, 10);
            ctx.restore();
        }
        
        ctx.restore();
    };

    const spin = () => {
        if (isSpinning || participants.length === 0) return;
        isSpinning = true;
        winnerDisplay.classList.add("hidden");
        controlsDisplay.classList.add("hidden");

        const spinAngle = Math.random() * 20 + 10; // Rotaciones aleatorias (entre 10 y 30)
        const spinTime = 6000; // Duración del giro en ms
        const start = performance.now();

        function animate(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / spinTime, 1);
            const easeOut = 1 - Math.pow(1 - progress, 4); // Curva de desaceleración suave

            currentAngle = (spinAngle * 2 * Math.PI) * easeOut;
            drawRoulette();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isSpinning = false;
                showWinner();
            }
        }
        requestAnimationFrame(animate);
    };
const showWinner = () => {
    const numSegments = participants.length;
    const anglePerSegment = (2 * Math.PI) / numSegments;
    
    // 1. Calcular el ángulo final de la ruleta (entre 0 y 2*PI)
    const finalAngle = currentAngle % (2 * Math.PI);
    
    // 2. Definir el ángulo del marcador (flecha).
    // La flecha está en la parte superior (posición 270 grados o 3*PI/2)
    // Usamos PI/2 como corrección para alinear el inicio del Segmento 0.
    const correctionAngle = Math.PI / 2; 

    // 3. Calcular el ángulo efectivo.
    let effectiveAngle = ((2 * Math.PI) - finalAngle + correctionAngle) % (2 * Math.PI);
    
    // 4. Determinar el índice del segmento ganador.
    let winningSegment = Math.floor(effectiveAngle / anglePerSegment);
    
    // 5. Ajuste de 180 grados (PI radianes) para corregir la inversión visual.
    // Esto asume que el cálculo todavía selecciona el lado opuesto.
    const oppositeIndexOffset = Math.floor(numSegments / 2);
    winningSegment = (winningSegment + oppositeIndexOffset) % numSegments;

    winningSegment = winningSegment % numSegments; 

    // OBTENER LA CADENA COMPLETA (Nombre Apellido (País))
    const winner = participants[winningSegment];

    // USAR LA CADENA COMPLETA PARA MOSTRAR EL GANADOR
    winnerDisplay.textContent = ` ${winner} `; 
    winnerDisplay.classList.remove("hidden");
    actionsDisplay.classList.remove("hidden");
    
    // Efecto de confeti
    confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
    });
};

    spinButton.addEventListener("click", spin);

    continueButton.addEventListener("click", () => {
        actionsDisplay.classList.add("hidden");
        winnerDisplay.classList.add("hidden");
        controlsDisplay.classList.remove("hidden");
    });
    
    endButton.addEventListener("click", () => {
       // Obtener el elemento del título (asegúrate de que el ID coincida con tu HTML)
       const titleElement = document.getElementById("mainTitle");
       
       if (titleElement) {
           titleElement.textContent = "Gracias por participar";
       }
       
       alert("¡Sorteo finalizado!");
       actionsDisplay.classList.add("hidden");
       winnerDisplay.classList.add("hidden");
       // Deshabilitar el botón de girar
       spinButton.disabled = true;
       controlsDisplay.classList.remove("hidden");
    })})