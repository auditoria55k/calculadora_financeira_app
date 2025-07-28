let userEvolutionChart, financialChart;
let scenariosDisponiveis = [];

// Função auxiliar para formatar moeda
function formatCurrency(value) {
    if (isNaN(value) || value === null || value === undefined) {
        return 'R$ 0';
    }
    
    // Para valores muito pequenos (menos de 0.01), usar mais casas decimais
    if (value < 0.01 && value > 0) {
        return `R$ ${value.toFixed(6)}`;
    }
    
    return `R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 0})}`;
}

function updateModelPricing() {
    const modelSelect = document.getElementById('openaiModel');
    const selectedOption = modelSelect.options[modelSelect.selectedIndex];
    
    const inputCost = parseFloat(selectedOption.getAttribute('data-input'));
    const outputCost = parseFloat(selectedOption.getAttribute('data-output'));
    
    document.getElementById('costPerInputToken').value = inputCost;
    document.getElementById('costPerOutputToken').value = outputCost;
    
    updatePercentageDisplay();
    calculatePricing();
}

// Variáveis globais para listeners
let timeout;

function setupInputListeners() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        // Remove listeners antigos para evitar duplicação
        input.removeEventListener('input', handleInputChange);
        input.removeEventListener('change', handleInputChange);
        input.removeEventListener('keyup', handleInputChange);
        input.removeEventListener('blur', handleInputChange);
        
        // Adiciona novos listeners para todos os tipos de mudança
        input.addEventListener('input', handleInputChange);
        input.addEventListener('change', handleInputChange);
        input.addEventListener('keyup', handleInputChange);
        input.addEventListener('blur', handleInputChange);
        
        // Listener especial para campos de porcentagem de planos
        if (input.id === 'percentBasic' || input.id === 'percentPro' || input.id === 'percentMax') {
            input.addEventListener('input', updateFreePercentage);
            input.addEventListener('change', updateFreePercentage);
        }
    });
}

function handleInputChange() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        // Verificar se o campo projectMonths foi alterado
        const projectMonthsField = document.getElementById('projectMonths');
        if (projectMonthsField && document.activeElement === projectMonthsField) {
            updateMonthRangeMax();
        }
        
        updatePercentageDisplay();
        calculatePricing();
    }, 100);
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Inicializar componentes básicos
        initializeCharts();
        
        initializeTooltips();
        
        loadAvailableScenarios();
        
        // Setup listeners
        setupModelListeners();
        setupTimeFilterListeners();
        setupInputListeners();
        
        // Adicionar listeners para botões e outros elementos
        document.getElementById('scenarioSelect').addEventListener('change', function() {
            if (this.value) {
                loadScenario(this.value);
            }
        });
        
        document.getElementById('saveBtn').addEventListener('click', function() {
            saveCurrentScenario();
        });
        
        document.getElementById('refreshBtn').addEventListener('click', function() {
            calculatePricing();
            this.style.transform = 'rotate(360deg)';
            setTimeout(() => this.style.transform = '', 500);
        });
        
        document.getElementById('exportPdfBtn').addEventListener('click', function() {
            const element = document.querySelector('.container');
            const opt = {
                margin: 0.5,
                filename: 'calculadora_auditor_ia.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
            };
            html2pdf().set(opt).from(element).save();
        });
        
        document.getElementById('setAsDefaultBtn').addEventListener('click', function() {
            setCurrentAsDefault();
        });
        
        document.getElementById('resetDefaultBtn').addEventListener('click', function() {
            resetToSystemDefault();
        });
        
        // Inicializar valores
        updateMonthRangeMax();
        
        updateTimeFilterDisplay();
        
        updatePercentageDisplay();
        
        // Carregar cenário padrão e calcular
        loadDefaultScenario();
        
        calculatePricing();
        
    } catch (error) {
        console.error('❌ Erro durante inicialização:', error);
    }
});

function setupModelListeners() {
    // Setup model selection listener
    document.getElementById('openaiModel').addEventListener('change', updateModelPricing);
}

function setupTimeFilterListeners() {
    // Setup time filter listeners
    document.getElementById('monthStart').addEventListener('input', function() {
        validateRangeInputs();
        updateTimeFilterDisplay();
        calculatePricing();
    });
    
    document.getElementById('monthEnd').addEventListener('input', function() {
        validateRangeInputs();
        updateTimeFilterDisplay();
        calculatePricing();
    });
    
    // Update month range max when project months change
    document.getElementById('projectMonths').addEventListener('change', function() {
        updateMonthRangeMax();
    });
}

function initializeTooltips() {
    const tooltip = document.getElementById('tooltip');
    
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const text = this.getAttribute('data-tooltip');
            tooltip.textContent = text;
            tooltip.classList.add('show');
        });
        
        element.addEventListener('mouseleave', function() {
            tooltip.classList.remove('show');
        });
        
        element.addEventListener('mousemove', function(e) {
            let x = e.clientX + 10;
            let y = e.clientY + 10;
            
            if (x + tooltip.offsetWidth > window.innerWidth) {
                x = e.clientX - tooltip.offsetWidth - 10;
            }
            if (y + tooltip.offsetHeight > window.innerHeight) {
                y = e.clientY - tooltip.offsetHeight - 10;
            }
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        });
    });
}

function getParameters() {
    
    const params = {
        initialUsers: parseInt(document.getElementById('initialUsers').value) || 0,
        startMonth: parseInt(document.getElementById('startMonth').value) || 1,
        monthlyUserIncrease: parseInt(document.getElementById('monthlyUserIncrease').value) || 0,
        projectMonths: parseInt(document.getElementById('projectMonths').value) || 12,
        usdBrl: parseFloat(document.getElementById('usdBrl').value) || 5.80,
        iofRate: parseFloat(document.getElementById('iofRate').value) / 100 || 0,
        costPerInputToken: parseFloat(document.getElementById('costPerInputToken').value) || 0,
        costPerOutputToken: parseFloat(document.getElementById('costPerOutputToken').value) || 0,
        ttsActive: document.getElementById('ttsActive').checked,
        ttsCost: parseFloat(document.getElementById('ttsCost').value) || 0,
        fixedMonthlyCost: parseFloat(document.getElementById('fixedMonthlyCost').value) || 0,
        consumptionFree: parseFloat(document.getElementById('consumptionFree').value) / 100 || 0.75,
        consumptionBasic: parseFloat(document.getElementById('consumptionBasic').value) / 100 || 0.85,
        consumptionPro: parseFloat(document.getElementById('consumptionPro').value) / 100 || 0.90,
        consumptionMax: parseFloat(document.getElementById('consumptionMax').value) / 100 || 0.95,
        consumptionAvulso: parseFloat(document.getElementById('consumptionAvulso').value) / 100 || 0.95,
        consumptionTrial: parseFloat(document.getElementById('consumptionTrial').value) / 100 || 0.80,
        tokensPerCredit: parseFloat(document.getElementById('tokensPerCredit').value) || 1000,
        inputOutputMix: parseFloat(document.getElementById('inputOutputMix').value) / 100 || 0.70,
        cac: parseFloat(document.getElementById('cac').value) || 150,
        ttsUsagePercent: parseFloat(document.getElementById('ttsUsagePercent').value) / 100 || 0.05,
        ttsMinutesPerCredit: parseFloat(document.getElementById('ttsMinutesPerCredit').value) || 0.02,
        creditsFree: parseInt(document.getElementById('creditsFree').value) || 0,
        creditsBasic: parseInt(document.getElementById('creditsBasic').value) || 0,
        creditsPro: parseInt(document.getElementById('creditsPro').value) || 0,
        creditsMax: parseInt(document.getElementById('creditsMax').value) || 0,
        priceFree: 0,
        priceBasic: parseFloat(document.getElementById('priceBasic').value) || 0,
        pricePro: parseFloat(document.getElementById('pricePro').value) || 0,
        priceMax: parseFloat(document.getElementById('priceMax').value) || 0,
        percentFree: parseFloat(document.getElementById('percentFree').value) / 100 || 0,
        percentBasic: parseFloat(document.getElementById('percentBasic').value) / 100 || 0,
        percentPro: parseFloat(document.getElementById('percentPro').value) / 100 || 0,
        percentMax: parseFloat(document.getElementById('percentMax').value) / 100 || 0,
        avulsoCredits: parseInt(document.getElementById('avulsoCredits').value) || 0,
        avulsoPrice: parseFloat(document.getElementById('avulsoPrice').value) || 0,
        avulsoPercentage: parseFloat(document.getElementById('avulsoPercentage').value) / 100 || 0,
        avulsoPackagesPerUser: parseFloat(document.getElementById('avulsoPackagesPerUser').value) || 1,
        postPaid: document.getElementById('postPaid').checked,
        defaultRisk: parseFloat(document.getElementById('defaultRisk').value) / 100 || 0,
        churnPaid: parseFloat(document.getElementById('churnPaid').value) / 100 || 0,
        churnFree: parseFloat(document.getElementById('churnFree').value) / 100 || 0,
        trialCredits: parseInt(document.getElementById('trialCredits').value) || 0,
        trialPercentage: parseFloat(document.getElementById('trialPercentage').value) / 100 || 0
    };
    
    return params;
}

function calculateCosts(params) {
    
    // Calcular custo por crédito baseado na configuração de tokens por crédito
    const tokensPerMillion = 1000000;
    const creditsPerMillion = tokensPerMillion / params.tokensPerCredit;
    let costPerCreditUSD = (params.costPerInputToken * params.inputOutputMix + params.costPerOutputToken * (1 - params.inputOutputMix)) / creditsPerMillion;
    
    // Adicionar custo TTS/STT se ativo
    if (params.ttsActive) {
        costPerCreditUSD += (params.ttsCost * params.ttsMinutesPerCredit * params.ttsUsagePercent);
    }
    
    // Converter para BRL
    const costPerCreditBRL = costPerCreditUSD * params.usdBrl * (1 + params.iofRate);
    
    // Atualizar campo de custo por crédito se existir
    const finalCostElement = document.getElementById('finalCostPerCredit');
    if (finalCostElement) {
        finalCostElement.value = costPerCreditBRL.toFixed(6);
    }
    
    return {
        costPerCredit: costPerCreditBRL,
        fixedMonthlyCost: params.fixedMonthlyCost,
        variableCosts: 0 // Será calculado posteriormente baseado no uso
    };
}

function simulateGrowth(params) {
    
    const growth = [];
    let currentUsers = params.initialUsers;
    
    for (let month = 1; month <= params.projectMonths; month++) {
        // Aplicar crescimento apenas a partir do mês de início
        if (month >= params.startMonth) {
            // Crescimento linear contínuo sem limitação de meta
            currentUsers += params.monthlyUserIncrease;
        }
        
        growth.push({
            month: month,
            users: Math.floor(currentUsers)
        });
        
    }
    
    return growth;
}

function calculateUserDistribution(params, totalUsers) {
    const freeUsers = Math.floor(totalUsers * params.percentFree);
    const basicUsers = Math.floor(totalUsers * params.percentBasic);
    const proUsers = Math.floor(totalUsers * params.percentPro);
    const maxUsers = Math.floor(totalUsers * params.percentMax);
    
    // Distribuir usuários restantes para o plano básico se houver diferença
    const distributedUsers = freeUsers + basicUsers + proUsers + maxUsers;
    const remainingUsers = totalUsers - distributedUsers;
    const adjustedBasicUsers = basicUsers + remainingUsers;
    
    const distribution = {
        freeUsers: freeUsers,
        basicUsers: adjustedBasicUsers,
        proUsers: proUsers,
        maxUsers: maxUsers
    };
    
    return distribution;
}

function calculateRevenue(params, costs, users) {
    
    // Distribuir usuários pelos planos
    const distribution = calculateUserDistribution(params, users);
    
    // Calcular receita de assinaturas
    const subscriptionRevenue = (distribution.basicUsers * params.priceBasic) +
                              (distribution.proUsers * params.pricePro) +
                              (distribution.maxUsers * params.priceMax);
    
    // Calcular receita de créditos avulsos
    const avulsoUsers = Math.floor(users * params.avulsoPercentage);
    const avulsoRevenue = avulsoUsers * params.avulsoPackagesPerUser * params.avulsoPrice;
    
    // Calcular receita de teste gratuito (usuários que pagam após o teste)
    const trialUsers = Math.floor(users * params.trialPercentage);
    const trialRevenue = trialUsers * params.priceBasic * 0.3; // 30% convertem
    
    const totalRevenue = subscriptionRevenue + avulsoRevenue + trialRevenue;
    
    return {
        totalRevenue: totalRevenue,
        subscriptionRevenue: subscriptionRevenue,
        avulsoRevenue: avulsoRevenue,
        trialRevenue: trialRevenue,
        freeUsers: distribution.freeUsers,
        basicUsers: distribution.basicUsers,
        proUsers: distribution.proUsers,
        maxUsers: distribution.maxUsers
    };
}

function calculateKPIs(revenue, costs, params, users) {
    
    const totalCosts = costs.fixedMonthlyCost + costs.variableCosts;
    const profit = revenue.totalRevenue - totalCosts;
    const margin = revenue.totalRevenue > 0 ? (profit / revenue.totalRevenue) * 100 : 0;
    
    // Calcular ROI: lucro dividido pelo custo
    const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
    
    // Calcular receita e lucro por crédito
    const totalCreditsUsed = costs.variableCosts > 0 ? costs.variableCosts / costs.costPerCredit : 0;
    let revenuePerCredit = totalCreditsUsed > 0 ? revenue.totalRevenue / totalCreditsUsed : 0;
    let profitPerCredit = revenuePerCredit - costs.costPerCredit;
    let profitMarginPerCredit = revenuePerCredit > 0 ? (profitPerCredit / revenuePerCredit) * 100 : 0;
    
    // Se não há créditos consumidos, calcular baseado na distribuição de usuários
    let estimatedCreditsUsed = totalCreditsUsed;
    if (estimatedCreditsUsed === 0 && users > 0) {
        const distribution = calculateUserDistribution(params, users);
        estimatedCreditsUsed = (distribution.freeUsers * params.creditsFree * params.consumptionFree) +
                              (distribution.basicUsers * params.creditsBasic * params.consumptionBasic) +
                              (distribution.proUsers * params.creditsPro * params.consumptionPro) +
                              (distribution.maxUsers * params.creditsMax * params.consumptionMax);
        
        // Adicionar créditos de teste e avulsos
        const trialUsers = Math.floor(users * params.trialPercentage);
        const avulsoUsers = Math.floor(users * params.avulsoPercentage);
        estimatedCreditsUsed += (trialUsers * params.trialCredits * params.consumptionTrial) +
                               (avulsoUsers * params.avulsoPackagesPerUser * params.avulsoCredits * params.consumptionAvulso);
        
        // Recalcular receita por crédito com a estimativa
        revenuePerCredit = estimatedCreditsUsed > 0 ? revenue.totalRevenue / estimatedCreditsUsed : 0;
        profitPerCredit = revenuePerCredit - costs.costPerCredit;
        profitMarginPerCredit = revenuePerCredit > 0 ? (profitPerCredit / revenuePerCredit) * 100 : 0;
    }
    
    const kpis = {
        totalRevenue: revenue.totalRevenue,
        totalCosts: totalCosts,
        profit: profit,
        margin: margin,
        roi: roi,
        variableCosts: costs.variableCosts,
        revenuePerCredit: revenuePerCredit,
        profitPerCredit: profitPerCredit,
        profitMarginPerCredit: profitMarginPerCredit,
        estimatedCreditsUsed: estimatedCreditsUsed
    };
    
    return kpis;
}

function updateTimeFilterDisplay() {
    
    const monthStart = document.getElementById('monthStart');
    const monthEnd = document.getElementById('monthEnd');
    const rangeText = document.getElementById('rangeText');
    const kpiPeriodTitle = document.getElementById('kpiPeriodTitle');
    const monthStartValue = document.getElementById('monthStartValue');
    const monthEndValue = document.getElementById('monthEndValue');
    
    if (!monthStart || !monthEnd || !rangeText || !kpiPeriodTitle || !monthStartValue || !monthEndValue) {
        return;
    }
    
    const startMonth = parseInt(monthStart.value) || 1;
    const endMonth = parseInt(monthEnd.value) || 12;
    
    // Update value displays
    monthStartValue.textContent = startMonth;
    monthEndValue.textContent = endMonth;
    
    if (startMonth === endMonth) {
        rangeText.textContent = `Mês ${startMonth}`;
        kpiPeriodTitle.textContent = `Mês ${startMonth}`;
    } else {
        rangeText.textContent = `Mês ${startMonth} até Mês ${endMonth}`;
        kpiPeriodTitle.textContent = `Meses ${startMonth} a ${endMonth}`;
    }
    
}

function validateRangeInputs() {
    const monthStart = document.getElementById('monthStart');
    const monthEnd = document.getElementById('monthEnd');
    
    const startMonth = parseInt(monthStart.value);
    const endMonth = parseInt(monthEnd.value);
    
    // Ensure start is not greater than end
    if (startMonth > endMonth) {
        monthStart.value = endMonth;
    }
}

function updateMonthRangeMax() {
    const projectMonths = parseInt(document.getElementById('projectMonths').value);
    const monthStart = document.getElementById('monthStart');
    const monthEnd = document.getElementById('monthEnd');
    
    // Update max values for both sliders
    monthStart.max = projectMonths;
    monthEnd.max = projectMonths;
    
    // Adjust current values if they exceed the new max
    if (parseInt(monthStart.value) > projectMonths) {
        monthStart.value = projectMonths;
    }
    if (parseInt(monthEnd.value) > projectMonths) {
        monthEnd.value = projectMonths;
    }
    
    updateTimeFilterDisplay();
}

function calculateAccumulatedData(growth, params, costs, startMonth, endMonth) {
    
    let totalRevenue = 0;
    let totalVariableCosts = 0;
    let totalFixedCosts = 0;
    let totalCredits = 0;
    
    // Calcular dados apenas para o período selecionado
    for (let i = startMonth - 1; i < Math.min(endMonth, growth.length); i++) {
        const monthData = growth[i];
        const users = monthData.users;
        
        if (users > 0) {
            // Calcular receita para este mês
            const revenue = calculateRevenue(params, costs, users);
            totalRevenue += revenue.totalRevenue;
            
            // Calcular créditos consumidos para este mês
            const monthCredits = calculateCreditsConsumed(params, costs, [monthData], i + 1, i + 1);
            totalCredits += monthCredits;
            
            // Calcular custos variáveis baseados no uso de créditos
            const variableCosts = monthCredits * costs.costPerCredit;
            totalVariableCosts += variableCosts;
            
        }
        
        // Custos fixos são os mesmos todos os meses
        totalFixedCosts += costs.fixedMonthlyCost;
    }
    
    // Calcular KPIs para o período com custos variáveis corretos
    const kpis = calculateKPIs(
        { totalRevenue: totalRevenue },
        { 
            fixedMonthlyCost: totalFixedCosts,
            variableCosts: totalVariableCosts,
            costPerCredit: costs.costPerCredit
        },
        params,
        growth[endMonth - 1]?.users || 0
    );
    
    return {
        kpis: kpis,
        totalCredits: totalCredits
    };
}

function calculateCreditsConsumed(params, costs, growth, startMonth, endMonth) {
    
    let totalCredits = 0;
    
    for (let i = startMonth - 1; i < Math.min(endMonth, growth.length); i++) {
        const monthData = growth[i];
        const users = monthData.users;
        
        if (users > 0) {
            // Distribuir usuários pelos planos
            const distribution = calculateUserDistribution(params, users);
            
            // Calcular créditos consumidos por plano
            const freeCredits = distribution.freeUsers * params.creditsFree * params.consumptionFree;
            const basicCredits = distribution.basicUsers * params.creditsBasic * params.consumptionBasic;
            const proCredits = distribution.proUsers * params.creditsPro * params.consumptionPro;
            const maxCredits = distribution.maxUsers * params.creditsMax * params.consumptionMax;
            
            // Créditos de teste gratuito
            const trialUsers = Math.floor(users * params.trialPercentage);
            const trialCredits = trialUsers * params.trialCredits * params.consumptionTrial;
            
            // Créditos avulsos
            const avulsoUsers = Math.floor(users * params.avulsoPercentage);
            const avulsoCredits = avulsoUsers * params.avulsoPackagesPerUser * params.avulsoCredits * params.consumptionAvulso;
            
            const monthCredits = freeCredits + basicCredits + proCredits + maxCredits + trialCredits + avulsoCredits;
            totalCredits += monthCredits;
            
        }
    }
    
    return totalCredits;
}

function calculatePricing() {
    
    try {
        const params = getParameters();
        
        const costs = calculateCosts(params);
        
        const growth = simulateGrowth(params);
        
        const startMonth = parseInt(document.getElementById('monthStart').value) || 1;
        const endMonth = parseInt(document.getElementById('monthEnd').value) || 12;
        
        // Calculate accumulated data for the selected range
        const accumulatedData = calculateAccumulatedData(growth, params, costs, startMonth, endMonth);
        
        displayKPIs(accumulatedData.kpis, growth, params, costs, startMonth, endMonth, accumulatedData.totalCredits);
        
        displayProjections(growth, params, costs);
        
        updateCharts(growth, params, costs);
        
    } catch (error) {
        console.error('❌ Erro durante cálculo de pricing:', error);
        console.error('Stack trace:', error.stack);
    }
}

function calculateBreakEven(params, costs) {
    // Busca binária para encontrar o número de usuários necessário para break even
    let low = 0;
    let high = 100000; // Limite máximo de usuários para busca
    let breakEvenUsers = 0;
    let iterations = 0;
    const maxIterations = 50; // Limitar iterações para evitar loops infinitos
    
    while (low <= high && iterations < maxIterations) {
        iterations++;
        const mid = Math.floor((low + high) / 2);
        const revenue = calculateRevenue(params, costs, mid);
        
        // Calcular custos variáveis baseados no número de usuários
        const creditsConsumed = calculateCreditsConsumed(params, costs, [{users: mid}], 1, 1);
        const variableCosts = creditsConsumed * costs.costPerCredit;
        const totalCosts = costs.fixedMonthlyCost + variableCosts;
        
        const profit = revenue.totalRevenue - totalCosts;
        
        if (Math.abs(profit) < 1) { // Próximo o suficiente do break even
            breakEvenUsers = mid;
            break;
        } else if (profit < 0) {
            low = mid + 1;
        } else {
            high = mid - 1;
            breakEvenUsers = mid;
        }
    }
    
    return breakEvenUsers;
}

function displayKPIs(kpis, growth, params, costs, startMonth, endMonth, creditsConsumed) {
    
    // Calcular break even separadamente
    const breakEvenUsers = calculateBreakEven(params, costs);
    
    // Usar créditos consumidos ou estimados
    const totalCredits = creditsConsumed > 0 ? creditsConsumed : kpis.estimatedCreditsUsed || 0;
    
    // Display main KPIs
    document.getElementById('totalRevenue').textContent = formatCurrency(kpis.totalRevenue);
    document.getElementById('totalCosts').textContent = formatCurrency(kpis.totalCosts);
    document.getElementById('profit').textContent = formatCurrency(kpis.profit);
    document.getElementById('margin').textContent = kpis.margin.toFixed(1) + '%';
    document.getElementById('roi').textContent = kpis.roi.toFixed(1) + '%';
    document.getElementById('breakEven').textContent = breakEvenUsers + ' usuários';
    document.getElementById('costPerCredit').textContent = formatCurrency(costs.costPerCredit);
    document.getElementById('revenuePerCredit').textContent = formatCurrency(kpis.revenuePerCredit);
    document.getElementById('profitPerCredit').textContent = formatCurrency(kpis.profitPerCredit) + ' (' + kpis.profitMarginPerCredit.toFixed(1) + '%)';
    document.getElementById('creditsConsumed').textContent = totalCredits.toLocaleString();
    document.getElementById('fixedCosts').textContent = formatCurrency(costs.fixedMonthlyCost);
    document.getElementById('variableCosts').textContent = formatCurrency(kpis.variableCosts);
    
    // Atualizar tooltips com cálculos explicativos
    updateKPITooltips(kpis, costs, totalCredits);
    
}

function updateKPITooltips(kpis, costs, totalCredits) {
    // ROI: lucro dividido pelo custo
    const roiElement = document.getElementById('roi');
    if (roiElement) {
        const roiCard = roiElement.closest('.kpi-card');
        if (roiCard) {
            roiCard.setAttribute('data-tooltip', 
                `ROI: Lucro ÷ Custo Total\n` +
                `${formatCurrency(kpis.profit)} ÷ ${formatCurrency(kpis.totalCosts)} = ${kpis.roi.toFixed(1)}%`
            );
        }
    }
    
    // Margem: lucro sobre receita total
    const marginElement = document.getElementById('margin');
    if (marginElement) {
        const marginCard = marginElement.closest('.kpi-card');
        if (marginCard) {
            marginCard.setAttribute('data-tooltip', 
                `Margem: Lucro ÷ Receita Total\n` +
                `${formatCurrency(kpis.profit)} ÷ ${formatCurrency(kpis.totalRevenue)} = ${kpis.margin.toFixed(1)}%`
            );
        }
    }
    
    // Lucro: receita menos despesa
    const profitElement = document.getElementById('profit');
    if (profitElement) {
        const profitCard = profitElement.closest('.kpi-card');
        if (profitCard) {
            profitCard.setAttribute('data-tooltip', 
                `Lucro: Receita Total - Custos Totais\n` +
                `${formatCurrency(kpis.totalRevenue)} - ${formatCurrency(kpis.totalCosts)} = ${formatCurrency(kpis.profit)}`
            );
        }
    }
    
    // Receita Total
    const revenueElement = document.getElementById('totalRevenue');
    if (revenueElement) {
        const revenueCard = revenueElement.closest('.kpi-card');
        if (revenueCard) {
            revenueCard.setAttribute('data-tooltip', 
                `Receita Total: Soma de todas as receitas\n` +
                `Planos + Avulsos + Testes = ${formatCurrency(kpis.totalRevenue)}`
            );
        }
    }
    
    // Custo Total
    const totalCostsElement = document.getElementById('totalCosts');
    if (totalCostsElement) {
        const totalCostsCard = totalCostsElement.closest('.kpi-card');
        if (totalCostsCard) {
            totalCostsCard.setAttribute('data-tooltip', 
                `Custo Total: Custos Fixos + Custos Variáveis\n` +
                `${formatCurrency(costs.fixedMonthlyCost)} + ${formatCurrency(kpis.variableCosts)} = ${formatCurrency(kpis.totalCosts)}`
            );
        }
    }
    
    // Custo por Crédito
    const costPerCreditElement = document.getElementById('costPerCredit');
    if (costPerCreditElement) {
        const costPerCreditCard = costPerCreditElement.closest('.kpi-card');
        if (costPerCreditCard) {
            costPerCreditCard.setAttribute('data-tooltip', 
                `Custo por Crédito: Custo médio de processamento\n` +
                `Custo por crédito = ${formatCurrency(costs.costPerCredit)}`
            );
        }
    }
    
    // Receita por Crédito
    const revenuePerCreditElement = document.getElementById('revenuePerCredit');
    if (revenuePerCreditElement) {
        const revenuePerCreditCard = revenuePerCreditElement.closest('.kpi-card');
        if (revenuePerCreditCard) {
            revenuePerCreditCard.setAttribute('data-tooltip', 
                `Receita por Crédito: Receita Total ÷ Créditos Consumidos\n` +
                `${formatCurrency(kpis.totalRevenue)} ÷ ${totalCredits.toLocaleString()} = ${formatCurrency(kpis.revenuePerCredit)}`
            );
        }
    }
    
    // Lucro por Crédito
    const profitPerCreditElement = document.getElementById('profitPerCredit');
    if (profitPerCreditElement) {
        const profitPerCreditCard = profitPerCreditElement.closest('.kpi-card');
        if (profitPerCreditCard) {
            profitPerCreditCard.setAttribute('data-tooltip', 
                `Lucro por Crédito: Receita por Crédito - Custo por Crédito\n` +
                `${formatCurrency(kpis.revenuePerCredit)} - ${formatCurrency(costs.costPerCredit)} = ${formatCurrency(kpis.profitPerCredit)} (${kpis.profitMarginPerCredit.toFixed(1)}%)`
            );
        }
    }
    
    // Créditos Consumidos
    const creditsConsumedElement = document.getElementById('creditsConsumed');
    if (creditsConsumedElement) {
        const creditsConsumedCard = creditsConsumedElement.closest('.kpi-card');
        if (creditsConsumedCard) {
            creditsConsumedCard.setAttribute('data-tooltip', 
                `Créditos Consumidos: Total de créditos utilizados pelos usuários\n` +
                `Soma de todos os planos e usuários = ${totalCredits.toLocaleString()} créditos`
            );
        }
    }
    
    // Custos Fixos
    const fixedCostsElement = document.getElementById('fixedCosts');
    if (fixedCostsElement) {
        const fixedCostsCard = fixedCostsElement.closest('.kpi-card');
        if (fixedCostsCard) {
            fixedCostsCard.setAttribute('data-tooltip', 
                `Custos Fixos: Custos mensais independentes do uso\n` +
                `Infraestrutura, pessoal, etc. = ${formatCurrency(costs.fixedMonthlyCost)}`
            );
        }
    }
    
    // Custos Variáveis
    const variableCostsElement = document.getElementById('variableCosts');
    if (variableCostsElement) {
        const variableCostsCard = variableCostsElement.closest('.kpi-card');
        if (variableCostsCard) {
            variableCostsCard.setAttribute('data-tooltip', 
                `Custos Variáveis: Custos baseados no uso de créditos\n` +
                `Créditos Consumidos × Custo por Crédito = ${totalCredits.toLocaleString()} × ${formatCurrency(costs.costPerCredit)} = ${formatCurrency(kpis.variableCosts)}`
            );
        }
    }
    
    // Break Even
    const breakEvenElement = document.getElementById('breakEven');
    if (breakEvenElement) {
        const breakEvenCard = breakEvenElement.closest('.kpi-card');
        if (breakEvenCard) {
            const breakEvenUsers = breakEvenElement.textContent;
            breakEvenCard.setAttribute('data-tooltip', 
                `Break Even: Número de usuários para receita = custos\n` +
                `Ponto onde o lucro é zero = ${breakEvenUsers}`
            );
        }
    }
}

function displayProjections(growth, params, costs) {
    const tbody = document.getElementById('monthlyTableBody');
    tbody.innerHTML = '';
    
    growth.forEach(monthData => {
        const revenue = calculateRevenue(params, costs, monthData.users);
        const kpis = calculateKPIs(revenue, costs, params, monthData.users);
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>Mês ${monthData.month}</td>
            <td>${monthData.users.toLocaleString('pt-BR')}</td>
            <td style="font-size: 10px;">${revenue.freeUsers}/${revenue.basicUsers}/${revenue.proUsers}/${revenue.maxUsers}</td>
            <td>R$ ${revenue.subscriptionRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</td>
            <td>R$ ${revenue.avulsoRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</td>
            <td>R$ ${kpis.variableCosts.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</td>
            <td>R$ ${kpis.profit.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</td>
            <td>${kpis.margin.toFixed(1)}%</td>
        `;
    });
}

function initializeCharts() {
    // Destroy existing charts if they exist
    if (userEvolutionChart) {
        userEvolutionChart.destroy();
    }
    if (financialChart) {
        financialChart.destroy();
    }
    
    Chart.defaults.color = '#e6edf3';
    Chart.defaults.borderColor = '#30363d';
    
    // User Evolution Chart
    const ctx1 = document.getElementById('userEvolutionChart').getContext('2d');
    userEvolutionChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6'],
            datasets: [
                {
                    label: 'Free',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#2ea043',
                    borderColor: '#2ea043',
                    borderWidth: 1
                },
                {
                    label: 'Básico',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#58a6ff',
                    borderColor: '#58a6ff',
                    borderWidth: 1
                },
                {
                    label: 'Pró',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#f78166',
                    borderColor: '#f78166',
                    borderWidth: 1
                },
                {
                    label: 'Max',
                    data: [0, 0, 0, 0, 0, 0],
                    backgroundColor: '#bd561d',
                    borderColor: '#bd561d',
                    borderWidth: 1
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { color: '#30363d' },
                    ticks: { color: '#e6edf3' }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: { color: '#30363d' },
                    ticks: { color: '#e6edf3' }
                }
            },
            plugins: {
                legend: { 
                    display: true,
                    position: 'top',
                    labels: { color: '#e6edf3' }
                }
            }
        }
    });
    
    // Financial Chart
    const ctx2 = document.getElementById('financialChart').getContext('2d');
    financialChart = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Mês 5', 'Mês 6'],
            datasets: [
                {
                    label: 'Receita Total',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: '#2ea043',
                    backgroundColor: 'rgba(46, 160, 67, 0.1)',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2
                },
                {
                    label: 'Custos Totais',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: '#f85149',
                    backgroundColor: 'rgba(248, 81, 73, 0.1)',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#30363d' },
                    ticks: { color: '#e6edf3' }
                },
                x: {
                    grid: { color: '#30363d' },
                    ticks: { color: '#e6edf3' }
                }
            },
            plugins: {
                legend: { 
                    display: true,
                    position: 'top',
                    labels: { color: '#e6edf3' }
                }
            }
        }
    });
}

function updateCharts(growth, params, costs) {
    if (!userEvolutionChart || !financialChart) {
        return;
    }
    
    try {
        // Update user evolution chart with user distribution data
        const labels = growth.map(m => `Mês ${m.month}`);
        const freeData = [];
        const basicData = [];
        const proData = [];
        const maxData = [];
        
        growth.forEach(monthData => {
            const revenue = calculateRevenue(params, costs, monthData.users);
            freeData.push(revenue.freeUsers);
            basicData.push(revenue.basicUsers);
            proData.push(revenue.proUsers);
            maxData.push(revenue.maxUsers);
        });
        
        userEvolutionChart.data.labels = labels;
        userEvolutionChart.data.datasets[0].data = freeData;
        userEvolutionChart.data.datasets[1].data = basicData;
        userEvolutionChart.data.datasets[2].data = proData;
        userEvolutionChart.data.datasets[3].data = maxData;
        userEvolutionChart.update();
        
        // Update financial chart
        const revenueData = [];
        const costData = [];
        
        growth.forEach(monthData => {
            const revenue = calculateRevenue(params, costs, monthData.users);
            const kpis = calculateKPIs(revenue, costs, params, monthData.users);
            revenueData.push(revenue.totalRevenue);
            costData.push(kpis.totalCosts);
        });
        
        financialChart.data.labels = labels;
        financialChart.data.datasets[0].data = revenueData;
        financialChart.data.datasets[1].data = costData;
        financialChart.update();
        
    } catch (error) {
        console.error('❌ Erro ao atualizar gráficos:', error);
    }
}

function updateFreePercentage() {
    const percentBasic = parseFloat(document.getElementById('percentBasic').value) || 0;
    const percentPro = parseFloat(document.getElementById('percentPro').value) || 0;
    const percentMax = parseFloat(document.getElementById('percentMax').value) || 0;
    
    const total = percentBasic + percentPro + percentMax;
    const freePercent = Math.max(0, 100 - total);
    
    document.getElementById('percentFree').value = freePercent.toFixed(0);
    
    updatePercentageDisplay();
}

function updatePercentageDisplay() {
    const percentBasic = parseFloat(document.getElementById('percentBasic').value) || 0;
    const percentPro = parseFloat(document.getElementById('percentPro').value) || 0;
    const percentMax = parseFloat(document.getElementById('percentMax').value) || 0;
    
    const total = percentBasic + percentPro + percentMax;
    const freePercent = Math.max(0, 100 - total);
    
    document.getElementById('totalPlanPercentage').textContent = total.toFixed(0);
    document.getElementById('freeUsersPercentage').textContent = '0';
    
    // Color coding
    const totalElement = document.getElementById('totalPlanPercentage');
    if (total > 100) {
        totalElement.style.color = '#f85149';
    } else if (total < 90) {
        totalElement.style.color = '#d29922';
    } else {
        totalElement.style.color = '#2ea043';
    }
}

// ============ SISTEMA DE CENÁRIOS ============

function loadAvailableScenarios() {
    // Cenários padrão incluídos no sistema
    scenariosDisponiveis = [
        { nome: 'Configuração Padrão', arquivo: 'default.json' },
        { nome: 'Startup Conservador', arquivo: 'startup_conservador.json' },
        { nome: 'Crescimento Agressivo', arquivo: 'crescimento_agressivo.json' }
    ];
    
    // Carregar cenários salvos localmente
    const savedScenarios = JSON.parse(localStorage.getItem('auditorIA_scenarios') || '[]');
    scenariosDisponiveis = [...scenariosDisponiveis, ...savedScenarios];
    
    updateScenarioSelect();
}

function updateScenarioSelect() {
    const select = document.getElementById('scenarioSelect');
    select.innerHTML = '<option value="">📁 Carregar Cenário</option>';
    
    scenariosDisponiveis.forEach(scenario => {
        const option = document.createElement('option');
        option.value = scenario.arquivo || scenario.nome;
        option.textContent = `${scenario.nome}`;
        select.appendChild(option);
    });
}

async function loadDefaultScenario() {
    try {
        
        // Tentar carregar configuração padrão personalizada do usuário
        const userDefault = localStorage.getItem('auditorIA_userDefaultConfig');
        if (userDefault) {
            const config = JSON.parse(userDefault);
            applyScenarioToForm(config);
            return;
        }
        
        // Se não há padrão personalizado, usar padrão do sistema
        loadBuiltinScenario('default');
        
    } catch (error) {
        console.error('Erro ao carregar cenário padrão:', error);
        // Using default values
    }
}

function setCurrentAsDefault() {
    try {
        const currentConfig = getCurrentScenarioData();
        currentConfig.nome = 'Configuração Padrão do Usuário';
        currentConfig.descricao = 'Configuração personalizada definida como padrão pelo usuário';
        currentConfig.autor = 'Usuário';
        
        localStorage.setItem('auditorIA_userDefaultConfig', JSON.stringify(currentConfig));
        
        alert('✅ Configuração atual definida como padrão!\n\nEssa configuração será carregada automaticamente sempre que abrir a calculadora.');
        
    } catch (error) {
        alert('Erro ao definir configuração padrão: ' + error.message);
    }
}

function resetToSystemDefault() {
    if (confirm('Deseja resetar para a configuração padrão do sistema?\n\nIsso removerá sua configuração personalizada.')) {
        localStorage.removeItem('auditorIA_userDefaultConfig');
        loadBuiltinScenario('default');
        alert('✅ Configuracao resetada para o padrão do sistema!');
    }
}

async function loadScenario(scenarioName) {
    try {
        // Verificar se é um cenário salvo localmente
        const savedScenarios = JSON.parse(localStorage.getItem('auditorIA_scenarios') || '[]');
        const localScenario = savedScenarios.find(s => s.nome === scenarioName);
        
        if (localScenario) {
            applyScenarioToForm(localScenario);
            return;
        }
        
        // Tentar carregar cenário built-in
        await loadBuiltinScenario(scenarioName);
        
    } catch (error) {
        alert('Erro ao carregar cenário: ' + error.message);
    }
}

async function loadBuiltinScenario(filename) {
    
    try {
        const builtinScenarios = {
            'default': {
                nome: "Cenário Padrão",
                parametros: {
                    crescimento: {
                        usuariosIniciais: 0,
                        mesInicioUsuario: 1,
                        aumentoAbsolutoMensal: 1,
                        periodoProjecao: 24
                    },
                    iaOperacionais: {
                        usdBrl: 5.80,
                        iofRate: 3.50,
                        custoInputToken: 2,
                        custoOutputToken: 8,
                        custoFixoMensal: 300
                    },
                    planos: {
                        free: { creditos: 15, preco: 0 },
                        basico: { creditos: 200, preco: 29.90 },
                        pro: { creditos: 1000, preco: 99.90 },
                        max: { creditos: 5000, preco: 299.90 }
                    },
                    distribuicao: {
                        percentFree: 60,
                        percentBasic: 25,
                        percentPro: 15,
                        percentMax: 0
                    },
                    creditosAvulsos: {
                        pacoteCreditos: 100,
                        precoPackage: 19.90,
                        percentualUsuarios: 1,
                        pacotesPorUsuario: 1,
                        posPago: false,
                        riscoInadimplencia: 3
                    },
                    churn: {
                        churnPagos: 20,
                        churnFree: 20
                    },
                    testeGratuito: {
                        creditosIniciais: 25,
                        percentualUsuarios: 100
                    },
                    consumoReal: {
                        consumoFree: 100,
                        consumoBasico: 100,
                        consumoPro: 100,
                        consumoMax: 100,
                        consumoAvulso: 100,
                        consumoTeste: 100
                    },
                    avancados: {
                        inputOutputMix: 70,
                        cac: 50,
                        ttsUsagePercent: 5,
                        ttsMinutesPerCredit: 0.02
                    }
                }
            }
        };
        
        const scenario = builtinScenarios[filename];
        if (scenario) {
            applyScenarioToForm(scenario);
            
            // Forçar recálculo após aplicar o cenário
            setTimeout(() => {
                calculatePricing();
            }, 100);
            
        } else {
            console.error('❌ Cenário não encontrado:', filename);
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar cenário built-in:', error);
    }
}

function applyScenarioToForm(scenario) {
    const params = scenario.parametros;
    
    try {
        
        // Aplicar parâmetros de crescimento
        
        document.getElementById('initialUsers').value = params.crescimento.usuariosIniciais;
        document.getElementById('startMonth').value = params.crescimento.mesInicioUsuario;
        document.getElementById('monthlyUserIncrease').value = params.crescimento.aumentoAbsolutoMensal;
        document.getElementById('projectMonths').value = params.crescimento.periodoProjecao;
        
        // Aplicar parâmetros de IA
        
        document.getElementById('usdBrl').value = params.iaOperacionais.usdBrl;
        document.getElementById('iofRate').value = params.iaOperacionais.iofRate;
        document.getElementById('costPerInputToken').value = params.iaOperacionais.custoInputToken;
        document.getElementById('costPerOutputToken').value = params.iaOperacionais.custoOutputToken;
        document.getElementById('fixedMonthlyCost').value = params.iaOperacionais.custoFixoMensal;
        
        // Aplicar novos parâmetros com verificação de existência
        if (params.iaOperacionais && params.iaOperacionais.modeloOpenAI) {
            const modelField = document.getElementById('openaiModel');
            if (modelField) modelField.value = params.iaOperacionais.modeloOpenAI;
        }
        if (params.iaOperacionais && params.iaOperacionais.ttsAtivo !== undefined) {
            const ttsField = document.getElementById('ttsActive');
            if (ttsField) ttsField.checked = params.iaOperacionais.ttsAtivo;
        }
        if (params.iaOperacionais && params.iaOperacionais.custoTTS) {
            const ttsCostField = document.getElementById('ttsCost');
            if (ttsCostField) ttsCostField.value = params.iaOperacionais.custoTTS;
        }
        if (params.iaOperacionais && params.iaOperacionais.tokensPerCredito) {
            const tokensField = document.getElementById('tokensPerCredit');
            if (tokensField) tokensField.value = params.iaOperacionais.tokensPerCredito;
        }
        
        // Aplicar taxa de consumo real
        if (params.consumoReal) {
            
            const freeField = document.getElementById('consumptionFree');
            const basicField = document.getElementById('consumptionBasic');
            const proField = document.getElementById('consumptionPro');
            const maxField = document.getElementById('consumptionMax');
            
            if (freeField) freeField.value = params.consumoReal.consumoFree;
            if (basicField) basicField.value = params.consumoReal.consumoBasico;
            if (proField) proField.value = params.consumoReal.consumoPro;
            if (maxField) maxField.value = params.consumoReal.consumoMax;
            
            const avulsoField = document.getElementById('consumptionAvulso');
            const trialField = document.getElementById('consumptionTrial');
            if (avulsoField && params.consumoReal.consumoAvulso) avulsoField.value = params.consumoReal.consumoAvulso;
            if (trialField && params.consumoReal.consumoTeste) trialField.value = params.consumoReal.consumoTeste;
            
        }
        
        // Aplicar parâmetros avançados
        if (params.avancados) {
            
            const mixField = document.getElementById('inputOutputMix');
            const cacField = document.getElementById('cac');
            const ttsUsageField = document.getElementById('ttsUsagePercent');
            const ttsMinutesField = document.getElementById('ttsMinutesPerCredit');
            
            if (mixField && params.avancados.inputOutputMix) mixField.value = params.avancados.inputOutputMix;
            if (cacField && params.avancados.cac) cacField.value = params.avancados.cac;
            if (ttsUsageField && params.avancados.ttsUsagePercent) ttsUsageField.value = params.avancados.ttsUsagePercent;
            if (ttsMinutesField && params.avancados.ttsMinutesPerCredit) ttsMinutesField.value = params.avancados.ttsMinutesPerCredit;
            
        }
        
        // Aplicar planos
        
        if (params.planos.free) {
            document.getElementById('creditsFree').value = params.planos.free.creditos;
        }
        document.getElementById('creditsBasic').value = params.planos.basico.creditos;
        document.getElementById('priceBasic').value = params.planos.basico.preco;
        document.getElementById('creditsPro').value = params.planos.pro.creditos;
        document.getElementById('pricePro').value = params.planos.pro.preco;
        document.getElementById('creditsMax').value = params.planos.max.creditos;
        document.getElementById('priceMax').value = params.planos.max.preco;
        
        // Aplicar distribuição
        if (params.distribuicao) {
            
            document.getElementById('percentFree').value = params.distribuicao.percentFree;
            document.getElementById('percentBasic').value = params.distribuicao.percentBasic;
            document.getElementById('percentPro').value = params.distribuicao.percentPro;
            document.getElementById('percentMax').value = params.distribuicao.percentMax;
            
        }
        
        // Aplicar créditos avulsos
        
        document.getElementById('avulsoCredits').value = params.creditosAvulsos.pacoteCreditos;
        document.getElementById('avulsoPrice').value = params.creditosAvulsos.precoPackage;
        if (params.creditosAvulsos.percentualUsuarios !== undefined) {
            document.getElementById('avulsoPercentage').value = params.creditosAvulsos.percentualUsuarios;
        }
        if (params.creditosAvulsos.pacotesPorUsuario !== undefined) {
            document.getElementById('avulsoPackagesPerUser').value = params.creditosAvulsos.pacotesPorUsuario;
        }
        document.getElementById('postPaid').checked = params.creditosAvulsos.posPago;
        document.getElementById('defaultRisk').value = params.creditosAvulsos.riscoInadimplencia;
        
        // Aplicar churn
        if (params.churn) {
            
            document.getElementById('churnPaid').value = params.churn.churnPagos;
            document.getElementById('churnFree').value = params.churn.churnFree;
            
        }
        
        // Aplicar teste gratuito
        
        document.getElementById('trialCredits').value = params.testeGratuito.creditosIniciais;
        document.getElementById('trialPercentage').value = params.testeGratuito.percentualUsuarios;
        
        // Atualizar displays
        updatePercentageDisplay();
        
        // Atualizar range máximo do slider após carregar cenário
        updateMonthRangeMax();
        
        // Reconfigurar listeners após carregar cenário
        setupInputListeners();
        
        // Forçar recálculo após aplicar o cenário
        setTimeout(() => {
            calculatePricing();
        }, 100);
        
    } catch (error) {
        console.error('❌ Erro ao aplicar cenário:', error);
        alert('Erro ao aplicar cenário. Verifique o formato do arquivo.');
    }
}

function getCurrentScenarioData() {
    return {
        nome: '',
        descricao: '',
        dataCriacao: new Date().toISOString().split('T')[0],
        autor: 'Usuário',
        parametros: {
            crescimento: {
                usuariosIniciais: parseInt(document.getElementById('initialUsers').value) || 0,
                mesInicioUsuario: parseInt(document.getElementById('startMonth').value) || 1,
                aumentoAbsolutoMensal: parseInt(document.getElementById('monthlyUserIncrease').value) || 0,
                periodoProjecao: parseInt(document.getElementById('projectMonths').value) || 12
            },
            iaOperacionais: {
                usdBrl: parseFloat(document.getElementById('usdBrl').value) || 5.80,
                iofRate: parseFloat(document.getElementById('iofRate').value) || 6.38,
                modeloOpenAI: document.getElementById('openaiModel').value || 'gpt-4o-mini',
                custoInputToken: parseFloat(document.getElementById('costPerInputToken').value) || 0,
                custoOutputToken: parseFloat(document.getElementById('costPerOutputToken').value) || 0,
                custoFixoMensal: parseFloat(document.getElementById('fixedMonthlyCost').value) || 0,
                ttsAtivo: document.getElementById('ttsActive').checked || false,
                custoTTS: parseFloat(document.getElementById('ttsCost').value) || 0.0114,
                tokensPerCredito: parseFloat(document.getElementById('tokensPerCredit').value) || 1000
            },
            planos: {
                free: {
                    creditos: parseInt(document.getElementById('creditsFree').value) || 0,
                    preco: 0
                },
                basico: {
                    creditos: parseInt(document.getElementById('creditsBasic').value) || 0,
                    preco: parseFloat(document.getElementById('priceBasic').value) || 0
                },
                pro: {
                    creditos: parseInt(document.getElementById('creditsPro').value) || 0,
                    preco: parseFloat(document.getElementById('pricePro').value) || 0
                },
                max: {
                    creditos: parseInt(document.getElementById('creditsMax').value) || 0,
                    preco: parseFloat(document.getElementById('priceMax').value) || 0
                }
            },
            distribuicao: {
                percentFree: parseFloat(document.getElementById('percentFree').value) || 0,
                percentBasic: parseFloat(document.getElementById('percentBasic').value) || 0,
                percentPro: parseFloat(document.getElementById('percentPro').value) || 0,
                percentMax: parseFloat(document.getElementById('percentMax').value) || 0
            },
            creditosAvulsos: {
                pacoteCreditos: parseInt(document.getElementById('avulsoCredits').value) || 0,
                precoPackage: parseFloat(document.getElementById('avulsoPrice').value) || 0,
                percentualUsuarios: parseFloat(document.getElementById('avulsoPercentage').value) || 0,
                pacotesPorUsuario: parseFloat(document.getElementById('avulsoPackagesPerUser').value) || 1,
                posPago: document.getElementById('postPaid').checked,
                riscoInadimplencia: parseFloat(document.getElementById('defaultRisk').value) || 0
            },
            churn: {
                churnPagos: parseFloat(document.getElementById('churnPaid').value) || 0,
                churnFree: parseFloat(document.getElementById('churnFree').value) || 0
            },
            testeGratuito: {
                creditosIniciais: parseInt(document.getElementById('trialCredits').value) || 0,
                percentualUsuarios: parseFloat(document.getElementById('trialPercentage').value) || 0
            },
            consumoReal: {
                consumoFree: parseFloat(document.getElementById('consumptionFree').value) || 75,
                consumoBasico: parseFloat(document.getElementById('consumptionBasic').value) || 85,
                consumoPro: parseFloat(document.getElementById('consumptionPro').value) || 90,
                consumoMax: parseFloat(document.getElementById('consumptionMax').value) || 95,
                consumoAvulso: parseFloat(document.getElementById('consumptionAvulso').value) || 95,
                consumoTeste: parseFloat(document.getElementById('consumptionTrial').value) || 80
            },
            avancados: {
                inputOutputMix: parseFloat(document.getElementById('inputOutputMix').value) || 70,
                cac: parseFloat(document.getElementById('cac').value) || 150,
                ttsUsagePercent: parseFloat(document.getElementById('ttsUsagePercent').value) || 5,
                ttsMinutesPerCredit: parseFloat(document.getElementById('ttsMinutesPerCredit').value) || 0.02
            }
        }
    };
}

function saveCurrentScenario() {
    const scenarioData = getCurrentScenarioData();
    
    // Solicitar nome e descrição
    const nome = prompt('Nome do cenário:', 'Meu Cenário ' + new Date().toLocaleDateString());
    if (!nome) return;
    
    const descricao = prompt('Descrição (opcional):', '');
    
    scenarioData.nome = nome;
    scenarioData.descricao = descricao || 'Cenário personalizado';
    
    // Perguntar se deve ser o padrão
    const setAsDefault = confirm('Definir este cenário como padrão? (será carregado automaticamente)');
    
    try {
        // Salvar no localStorage
        const savedScenarios = JSON.parse(localStorage.getItem('auditorIA_scenarios') || '[]');
        
        // Verificar se já existe um cenário com o mesmo nome
        const existingIndex = savedScenarios.findIndex(s => s.nome === nome);
        if (existingIndex >= 0) {
            if (!confirm('Já existe um cenário com este nome. Deseja sobrescrever?')) {
                return;
            }
            savedScenarios[existingIndex] = scenarioData;
        } else {
            savedScenarios.push(scenarioData);
        }
        
        localStorage.setItem('auditorIA_scenarios', JSON.stringify(savedScenarios));
        
        // Definir como padrão se solicitado
        if (setAsDefault) {
            localStorage.setItem('auditorIA_defaultScenario', JSON.stringify(scenarioData));
        }
        
        // Atualizar lista de cenários
        loadAvailableScenarios();
        
        // Baixar arquivo JSON
        downloadScenarioFile(scenarioData);
        
        alert('Cenário salvo com sucesso!' + (setAsDefault ? ' (Definido como padrão)' : ''));
        
    } catch (error) {
        // Save error suppressed
        alert('Erro ao salvar cenário: ' + error.message);
    }
}

function downloadScenarioFile(scenarioData) {
    const dataStr = JSON.stringify(scenarioData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scenarioData.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

// Função para importar cenário de arquivo
function importScenarioFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const scenario = JSON.parse(e.target.result);
                    
                    // Validar estrutura básica
                    if (!scenario.parametros) {
                        throw new Error('Arquivo inválido: falta estrutura de parâmetros');
                    }
                    
                    applyScenarioToForm(scenario);
                    alert('Cenário importado com sucesso: ' + scenario.nome);
                    
                } catch (error) {
                    alert('Erro ao importar arquivo: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}