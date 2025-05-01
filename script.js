document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const calculateBtn = document.getElementById("calculate-btn");
  const mixedConfigsContainer = document.getElementById("mixed-configs");
  const paleteVisual = document.getElementById("palete-visual");

  // Initial values
  let garrafasPequenas = {
    nome: "330ml",
    altura: 157,
    diametro: 65,
    volume: 330,
  };

  let garrafasGrandes = {
    nome: "1L",
    altura: 215,
    diametro: 90,
    volume: 1000,
  };

  let palete = {
    comprimento: 1200,
    largura: 800,
    alturaMaxima: 1800,
  };

  let camadaPequena, camadaGrande, maxCamadasPequenas, maxCamadasGrandes;
  let melhorConfiguracao = null;
  let configuracoesValidas = [];

  // Function to calculate bottles per layer
  function calcularGarrafasPorCamada(diametroGarrafa, dimensoesPalete) {
    const garrafasPorComprimento = Math.floor(
      dimensoesPalete.comprimento / diametroGarrafa
    );
    const garrafasPorLargura = Math.floor(
      dimensoesPalete.largura / diametroGarrafa
    );

    return {
      garrafasPorComprimento,
      garrafasPorLargura,
      total: garrafasPorComprimento * garrafasPorLargura,
    };
  }

  // Function to calculate maximum layers based on height
  function calcularMaximoCamadas(alturaGarrafa, alturaMaximaPalete) {
    return Math.floor(alturaMaximaPalete / alturaGarrafa);
  }

  // Calculate mixed pallet configurations
  function calcularPaleteMisto(numCamadasGrandes, numCamadasPequenas) {
    const alturaTotal =
      numCamadasGrandes * garrafasGrandes.altura +
      numCamadasPequenas * garrafasPequenas.altura;

    if (alturaTotal > palete.alturaMaxima) {
      return { valido: false, alturaTotal };
    }

    return {
      valido: true,
      alturaTotal,
      camadas: {
        grandes: numCamadasGrandes,
        pequenas: numCamadasPequenas,
      },
      quantidades: {
        grandes: numCamadasGrandes * camadaGrande.total,
        pequenas: numCamadasPequenas * camadaPequena.total,
      },
      volumeTotal: {
        grandes:
          (numCamadasGrandes * camadaGrande.total * garrafasGrandes.volume) /
          1000, // in liters
        pequenas:
          (numCamadasPequenas * camadaPequena.total * garrafasPequenas.volume) /
          1000, // in liters
      },
      percentagemOcupada: ((alturaTotal / palete.alturaMaxima) * 100).toFixed(
        1
      ),
    };
  }

  // Function to update results on screen
  function atualizarResultados() {
    // Update results for small bottles
    document.getElementById("small-per-layer").textContent =
      camadaPequena.total;
    document.getElementById(
      "small-layer-detail"
    ).textContent = `${camadaPequena.garrafasPorComprimento} × ${camadaPequena.garrafasPorLargura} bottles`;
    document.getElementById("max-small-layers").textContent =
      maxCamadasPequenas;
    document.getElementById("total-small-bottles").textContent =
      maxCamadasPequenas * camadaPequena.total;

    // Update results for large bottles
    document.getElementById("large-per-layer").textContent = camadaGrande.total;
    document.getElementById(
      "large-layer-detail"
    ).textContent = `${camadaGrande.garrafasPorComprimento} × ${camadaGrande.garrafasPorLargura} bottles`;
    document.getElementById("max-large-layers").textContent = maxCamadasGrandes;
    document.getElementById("total-large-bottles").textContent =
      maxCamadasGrandes * camadaGrande.total;

    // Clear previous configurations
    mixedConfigsContainer.innerHTML = "";

    // Add mixed configurations
    configuracoesValidas.slice(0, 5).forEach((config, index) => {
      const configCard = document.createElement("div");
      configCard.className = "config-option";
      configCard.setAttribute("data-index", index);

      if (index === 0) {
        configCard.classList.add("selected");
        renderizarVisualizacao(config);
      }

      const volumeTotal =
        config.volumeTotal.grandes + config.volumeTotal.pequenas;

      configCard.innerHTML = `
                <h4>${config.camadas.grandes} layers of 1L + ${
        config.camadas.pequenas
      } layers of 330ml</h4>
                <div class="config-details">
                    <div class="config-detail">
                        <div><strong>Height:</strong> ${
                          config.alturaTotal
                        }mm (${config.percentagemOcupada}%)</div>
                        <div><strong>Total:</strong> ${volumeTotal.toFixed(
                          2
                        )} liters</div>
                    </div>
                    <div class="config-detail">
                        <div><strong>1L:</strong> ${
                          config.quantidades.grandes
                        } bottles (${config.volumeTotal.grandes.toFixed(
        2
      )} L)</div>
                        <div><strong>330ml:</strong> ${
                          config.quantidades.pequenas
                        } bottles (${config.volumeTotal.pequenas.toFixed(
        2
      )} L)</div>
                    </div>
                </div>
            `;

      configCard.addEventListener("click", function () {
        document.querySelectorAll(".config-option").forEach((card) => {
          card.classList.remove("selected");
        });
        this.classList.add("selected");
        const configIndex = parseInt(this.getAttribute("data-index"));
        renderizarVisualizacao(configuracoesValidas[configIndex]);
      });

      mixedConfigsContainer.appendChild(configCard);
    });
  }

  // Function to render pallet visualization
  function renderizarVisualizacao(config) {
    // Clear previous visualization (except the base)
    const layers = paleteVisual.querySelectorAll(".layer");
    layers.forEach((layer) => layer.remove());

    const totalCamadas = config.camadas.grandes + config.camadas.pequenas;
    const alturaBase = 10; // in pixels
    const alturaDisponivel = 400; // available height for layers
    const alturaUnidade = alturaDisponivel / totalCamadas;

    // Add large bottle layers
    for (let i = 0; i < config.camadas.grandes; i++) {
      const layer = document.createElement("div");
      layer.className = "layer large";
      const bottom = alturaBase + i * alturaUnidade;
      layer.style.bottom = `${bottom}px`;
      layer.style.height = `${alturaUnidade - 2}px`; // -2 for spacing
      paleteVisual.appendChild(layer);
    }

    // Add small bottle layers
    for (let i = 0; i < config.camadas.pequenas; i++) {
      const layer = document.createElement("div");
      layer.className = "layer";
      const bottom = alturaBase + (i + config.camadas.grandes) * alturaUnidade;
      layer.style.bottom = `${bottom}px`;
      layer.style.height = `${alturaUnidade - 2}px`; // -2 for spacing
      paleteVisual.appendChild(layer);
    }
  }

  // Main calculation function
  function calcular() {
    // Get values from inputs
    garrafasPequenas.altura = parseInt(
      document.getElementById("small-height").value
    );
    garrafasPequenas.diametro = parseInt(
      document.getElementById("small-diameter").value
    );
    garrafasPequenas.volume = parseInt(
      document.getElementById("small-volume").value
    );

    garrafasGrandes.altura = parseInt(
      document.getElementById("large-height").value
    );
    garrafasGrandes.diametro = parseInt(
      document.getElementById("large-diameter").value
    );
    garrafasGrandes.volume = parseInt(
      document.getElementById("large-volume").value
    );

    palete.comprimento = parseInt(
      document.getElementById("pallet-length").value
    );
    palete.largura = parseInt(document.getElementById("pallet-width").value);
    palete.alturaMaxima = parseInt(
      document.getElementById("pallet-height").value
    );

    // Perform calculations
    camadaPequena = calcularGarrafasPorCamada(
      garrafasPequenas.diametro,
      palete
    );
    maxCamadasPequenas = calcularMaximoCamadas(
      garrafasPequenas.altura,
      palete.alturaMaxima
    );

    camadaGrande = calcularGarrafasPorCamada(garrafasGrandes.diametro, palete);
    maxCamadasGrandes = calcularMaximoCamadas(
      garrafasGrandes.altura,
      palete.alturaMaxima
    );

    // Find all valid configurations
    configuracoesValidas = [];
    melhorConfiguracao = { grandes: 0, pequenas: 0, volumeTotal: 0 };

    for (let g = 0; g <= maxCamadasGrandes; g++) {
      for (let p = 0; p <= maxCamadasPequenas; p++) {
        if (g === 0 && p === 0) continue; // Skip empty configuration

        const resultado = calcularPaleteMisto(g, p);
        if (resultado.valido) {
          configuracoesValidas.push(resultado);

          const volumeTotal =
            resultado.volumeTotal.grandes + resultado.volumeTotal.pequenas;
          if (volumeTotal > melhorConfiguracao.volumeTotal) {
            melhorConfiguracao = {
              grandes: g,
              pequenas: p,
              volumeTotal: volumeTotal,
              resultado: resultado,
            };
          }
        }
      }
    }

    // Sort configurations by total volume
    configuracoesValidas.sort((a, b) => {
      const volumeTotalA = a.volumeTotal.grandes + a.volumeTotal.pequenas;
      const volumeTotalB = b.volumeTotal.grandes + b.volumeTotal.pequenas;
      return volumeTotalB - volumeTotalA;
    });

    // Update interface
    atualizarResultados();
  }

  // Event for the calculate button
  calculateBtn.addEventListener("click", calcular);

  // Calculate initial results
  calcular();
});
