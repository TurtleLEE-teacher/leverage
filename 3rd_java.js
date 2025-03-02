
// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 기본 행 수 (기본값: 3개월)
    let rowCount = 3;
    
    // 입력 테이블 생성 함수 호출
    generateInputTable(rowCount);
    
    // 행 수 변경 버튼 이벤트 설정
    document.getElementById('apply-row-count').addEventListener('click', function() {
        const newRowCount = parseInt(document.getElementById('row-count').value);
        rowCount = newRowCount;
        generateInputTable(newRowCount);
    });
    
    // 계산 버튼 클릭 이벤트 설정
    document.getElementById('calculate-btn').addEventListener('click', calculateForecast);
    
    // 엑셀 붙여넣기 처리 버튼 이벤트
    document.getElementById('process-paste').addEventListener('click', processPasteData);
    
    // 입력값 초기화 버튼 이벤트
    document.getElementById('clear-table').addEventListener('click', function() {
        generateInputTable(rowCount, true); // true = 값 초기화
    });
    
    // 샘플 데이터 입력 버튼 이벤트
    document.getElementById('paste-example').addEventListener('click', function() {
        const sampleData = generateSampleData(rowCount);
        fillTableWithData(sampleData);
    });
    
    // 붙여넣기 영역 클릭 시 텍스트 선택
    document.getElementById('excel-paste-area').addEventListener('click', function() {
        if (this.innerText === '여기에 엑셀 데이터를 붙여넣으세요...') {
            this.innerText = '';
        }
        this.focus();
    });
});

// 샘플 데이터 생성 함수 (내림차순으로 수정)
function generateSampleData(count) {
    const data = [];
    const koreanMonths = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    
    // 내림차순으로 생성 (최근 월부터 과거로)
    for (let i = 0; i < count; i++) {
        // 현재 월부터 과거로 내려감
        const monthIndex = (currentMonth - i + 12) % 12;
        // 최근 월일수록 더 높은 매출과 비용 (기본 패턴)
        const revenue = 1000 - i * 50; // 최근 월이 가장 높고 점점 감소
        const cost = 700 - i * 30; // 최근 월이 가장 높고 점점 감소
        
        data.push({
            month: koreanMonths[monthIndex],
            revenue: revenue,
            cost: cost
        });
    }
    
    return data;
}

// 동적으로 입력 테이블 생성 함수 (내림차순으로 수정)
function generateInputTable(count, clearValues = false) {
    const tableBody = document.getElementById('input-table-body');
    tableBody.innerHTML = ''; // 기존 행 초기화
    
    const koreanMonths = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    
    for (let i = 0; i < count; i++) {
        const row = document.createElement('tr');
        
        // 월 선택 셀
        const monthCell = document.createElement('td');
        monthCell.className = 'input-cell';
        
        const monthSelect = document.createElement('select');
        monthSelect.id = `month-select-${i}`;
        
        koreanMonths.forEach((month, idx) => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            
            // 기본 선택 월 설정 (내림차순: 최근 월부터 과거로)
            const monthIndex = (currentMonth - i + 12) % 12;
            if (idx === monthIndex) {
                option.selected = true;
            }
            
            monthSelect.appendChild(option);
        });
        
        monthCell.appendChild(monthSelect);
        row.appendChild(monthCell);
        
        // 매출 입력 셀
        const revenueCell = document.createElement('td');
        revenueCell.className = 'input-cell';
        
        const revenueInput = document.createElement('input');
        revenueInput.type = 'number';
        revenueInput.id = `revenue-input-${i}`;
        // 더 최근 월이 더 높은 매출
        revenueInput.placeholder = `예: ${1000 - i * 50}`;
        
        if (!clearValues) {
            revenueInput.value = 1000 - i * 50; // 기본값 설정 (내림차순)
        }
        
        revenueCell.appendChild(revenueInput);
        row.appendChild(revenueCell);
        
        // 비용 입력 셀
        const costCell = document.createElement('td');
        costCell.className = 'input-cell';
        
        const costInput = document.createElement('input');
        costInput.type = 'number';
        costInput.id = `cost-input-${i}`;
        // 더 최근 월이 더 높은 비용
        costInput.placeholder = `예: ${700 - i * 30}`;
        
        if (!clearValues) {
            costInput.value = 700 - i * 30; // 기본값 설정 (내림차순)
        }
        
        costCell.appendChild(costInput);
        row.appendChild(costCell);
        
        // 행 추가
        tableBody.appendChild(row);
    }
}

// 엑셀 붙여넣기 데이터 처리 함수
function processPasteData() {
    const pasteContent = document.getElementById('excel-paste-area').innerText.trim();
    
    if (pasteContent === '' || pasteContent === '여기에 엑셀 데이터를 붙여넣으세요...') {
        alert('붙여넣을 데이터가 없습니다.');
        return;
    }
    
    try {
        // 붙여넣은 데이터 파싱
        const rows = pasteContent.split(/\r\n|\n/);
        const data = [];
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row === '') continue;
            
            // 탭이나 여러 공백으로 분리된 데이터 처리
            const columns = row.split(/\t|    |  /);
            
            if (columns.length < 3) {
                // 처리할 수 없는 형식의 경우 경고
                alert('데이터 형식이 올바르지 않습니다. 엑셀에서 [월, 매출, 비용] 순서로 데이터를 복사해주세요.');
                return;
            }
            
            // 월, 매출, 비용 데이터 추출
            const month = columns[0].trim();
            const revenue = parseFloat(columns[1].replace(/,/g, ''));
            const cost = parseFloat(columns[2].replace(/,/g, ''));
            
            if (isNaN(revenue) || isNaN(cost)) {
                alert(`${i+1}번째 행의 데이터가 올바르지 않습니다. 숫자 형식을 확인해주세요.`);
                return;
            }
            
            data.push({
                month: month,
                revenue: revenue,
                cost: cost
            });
        }
        
        // 행 수 업데이트 및 테이블 생성
        const newRowCount = data.length;
        document.getElementById('row-count').value = newRowCount;
        generateInputTable(newRowCount, true); // 값 초기화로 생성
        
        // 파싱된 데이터로 테이블 채우기
        fillTableWithData(data);
        
        // 붙여넣기 영역 초기화
        document.getElementById('excel-paste-area').innerText = '여기에 엑셀 데이터를 붙여넣으세요...';
        
    } catch (error) {
        alert('데이터 처리 중 오류가 발생했습니다: ' + error.message);
    }
}

// 데이터로 테이블 채우기 함수
function fillTableWithData(data) {
    for (let i = 0; i < data.length; i++) {
        const monthSelect = document.getElementById(`month-select-${i}`);
        const revenueInput = document.getElementById(`revenue-input-${i}`);
        const costInput = document.getElementById(`cost-input-${i}`);
        
        // 월 설정 (정확한 월 이름이 없으면 가장 근접한 이름 찾기)
        const month = data[i].month;
        for (let j = 0; j < monthSelect.options.length; j++) {
            if (monthSelect.options[j].value.includes(month) || month.includes(monthSelect.options[j].value)) {
                monthSelect.selectedIndex = j;
                break;
            }
        }
        
        revenueInput.value = data[i].revenue;
        costInput.value = data[i].cost;
    }
}

// 숫자 포맷팅 함수
function formatNumber(num) {
    return Math.round(num).toLocaleString('ko-KR');
}

// 예측 계산 및 표시
function calculateForecast() {
    try {
        // 입력 데이터 수집
        const pastData = [];
        
        // 현재 입력 테이블의 행 수
        const rows = document.getElementById('input-table-body').getElementsByTagName('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const monthSelect = document.getElementById(`month-select-${i}`);
            const revenueInput = document.getElementById(`revenue-input-${i}`);
            const costInput = document.getElementById(`cost-input-${i}`);
            
            const monthName = monthSelect.value;
            const revenue = parseFloat(revenueInput.value);
            const cost = parseFloat(costInput.value);
            
            if (!monthName || isNaN(revenue) || isNaN(cost)) {
                alert(`${i+1}번째 행의 데이터가 올바르지 않습니다. 모든 필드를 채워주세요.`);
                return;
            }
            
            pastData.push({
                month: monthName,
                revenue: revenue,
                cost: cost,
                profit: revenue - cost,
                marginPercent: ((revenue - cost) / revenue * 100).toFixed(2)
            });
        }
        
        // 데이터가 충분한지 확인
        if (pastData.length < 2) {
            alert('정확한 예측을 위해 최소 2개월 이상의 데이터가 필요합니다.');
            return;
        }
        
        // 내림차순으로 입력된 데이터를 오름차순으로 변환 (과거 -> 최근)
        pastData.reverse();
        
        // 예측 실행
        const results = generateForecast(pastData);
        
        // 결과 표시
        displayResults(results);
        
        // 재무 요약 생성 및 표시
        generateFinancialSummary(results);
        
    } catch (error) {
        alert("계산 중 오류가 발생했습니다: " + error.message);
    }
}

// 향후 6개월 예측 함수
function generateForecast(pastData) {
    // 선형 회귀 계산
    const revenueRegression = calculateLinearRegression(pastData.map((d, i) => ({ x: i, y: d.revenue })));
    const costRegression = calculateLinearRegression(pastData.map((d, i) => ({ x: i, y: d.cost })));
    
    // 다음 6개월 예측 데이터
    const futureData = [];
    
    // 마지막 월 이름에서 다음 월 이름 생성을 위한 처리
    const lastMonthName = pastData[pastData.length - 1].month;
    const koreanMonths = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    let lastMonthIndex = koreanMonths.indexOf(lastMonthName);
    
    if (lastMonthIndex === -1) lastMonthIndex = 0;
    
    // 과거 데이터 합계
    let pastTotalRevenue = 0;
    let pastTotalCost = 0;
    let pastTotalProfit = 0;
    
    pastData.forEach(d => {
        pastTotalRevenue += d.revenue;
        pastTotalCost += d.cost;
        pastTotalProfit += d.profit;
    });
    
    // 향후 6개월 예측
    let futureTotalRevenue = 0;
    let futureTotalCost = 0;
    let futureTotalProfit = 0;
    let futureTotalMarginPercent = 0;
    
    for (let i = 0; i < 6; i++) {
        // 다음 월 계산
        const nextMonthIndex = (lastMonthIndex + i + 1) % 12;
        const monthName = koreanMonths[nextMonthIndex];
        
        // 선형 회귀로 예측
        const monthOffset = pastData.length + i;
        const revenue = revenueRegression.slope * monthOffset + revenueRegression.intercept;
        const cost = costRegression.slope * monthOffset + costRegression.intercept;
        const profit = revenue - cost;
        const marginPercent = (profit / revenue * 100).toFixed(2);
        
        futureData.push({
            month: monthName,
            revenue: revenue,
            cost: cost,
            profit: profit,
            marginPercent: marginPercent
        });
        
        // 합계 누적
        futureTotalRevenue += revenue;
        futureTotalCost += cost;
        futureTotalProfit += profit;
        futureTotalMarginPercent += parseFloat(marginPercent);
    }
    
    // 평균 수익률
    const avgMarginPercent = futureTotalMarginPercent / 6;
    
    // 추세 기반 신뢰도 점수 계산
    const trendStrength = Math.abs(revenueRegression.correlation);
    const confidenceScore = Math.round(trendStrength * 100);
    
    // 모든 월 데이터 (과거 + 미래)
    const allMonthsData = [...pastData, ...futureData];
    
    // 과거 데이터 평균
    const pastAvgRevenue = pastTotalRevenue / pastData.length;
    const pastAvgCost = pastTotalCost / pastData.length;
    const pastAvgProfit = pastTotalProfit / pastData.length;
    const pastAvgMarginPercent = pastData.reduce((sum, d) => sum + parseFloat(d.marginPercent), 0) / pastData.length;
    
    return {
        pastData: pastData,
        futureData: futureData,
        allMonthsData: allMonthsData,
        totalRevenue: futureTotalRevenue,
        totalCost: futureTotalCost,
        totalProfit: futureTotalProfit,
        avgMarginPercent: avgMarginPercent,
        confidenceScore: confidenceScore,
        revenueRegression: revenueRegression,
        costRegression: costRegression,
        pastTotalRevenue: pastTotalRevenue,
        pastTotalCost: pastTotalCost,
        pastTotalProfit: pastTotalProfit,
        pastAvgRevenue: pastAvgRevenue,
        pastAvgCost: pastAvgCost,
        pastAvgProfit: pastAvgProfit,
        pastAvgMarginPercent: pastAvgMarginPercent
    };
}

// 선형 회귀 계산 함수
function calculateLinearRegression(data) {
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += data[i].x;
        sumY += data[i].y;
        sumXY += data[i].x * data[i].y;
        sumXX += data[i].x * data[i].x;
        sumYY += data[i].y * data[i].y;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // 상관계수 계산
    const correlation = (n * sumXY - sumX * sumY) / 
        (Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)));
    
    return { slope, intercept, correlation };
}

// 결과 표시 함수
function displayResults(results) {
    // 결과 섹션 표시
    document.getElementById('results').style.display = 'block';
    
    // 스크롤 이동
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    
    // 주요 지표 표시
    document.getElementById('avg-profit-margin').textContent = results.avgMarginPercent.toFixed(2) + '%';
    document.getElementById('total-revenue').textContent = formatNumber(results.totalRevenue) + '만원';
    document.getElementById('total-profit').textContent = formatNumber(results.totalProfit) + '만원';
    document.getElementById('confidence-score').textContent = results.confidenceScore + '/100';
    
    // 테이블 데이터 추가
    const tableBody = document.getElementById('results-table-body');
    tableBody.innerHTML = ''; // 테이블 내용 초기화
    
    // 과거 데이터 행 (회색 배경)
    results.pastData.forEach(month => {
        const row = document.createElement('tr');
        row.style.backgroundColor = '#f0f0f0';
        
        // 셀 추가
        row.innerHTML = `
            <td>${month.month} (과거)</td>
            <td>${formatNumber(month.revenue)}</td>
            <td>${formatNumber(month.cost)}</td>
            <td>${formatNumber(month.profit)}</td>
            <td>${month.marginPercent}%</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 미래 데이터 행
    results.futureData.forEach(month => {
        const row = document.createElement('tr');
        
        // 셀 추가
        row.innerHTML = `
            <td>${month.month} (예측)</td>
            <td>${formatNumber(month.revenue)}</td>
            <td>${formatNumber(month.cost)}</td>
            <td>${formatNumber(month.profit)}</td>
            <td>${month.marginPercent}%</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 차트 생성
    createChart(results);
}

// 차트 생성 함수
function createChart(results) {
    const ctx = document.getElementById('forecast-chart').getContext('2d');
    
    // 기존 차트가 있으면 제거
    if (window.forecastChart) {
        window.forecastChart.destroy();
    }
    
    // 과거 및 미래 월 이름 준비
    const pastMonths = results.pastData.map(d => d.month + ' (과거)');
    const futureMonths = results.futureData.map(d => d.month + ' (예측)');
    const allMonths = [...pastMonths, ...futureMonths];
    
    // 데이터 준비
    const pastRevenues = results.pastData.map(d => d.revenue);
    const pastCosts = results.pastData.map(d => d.cost);
    const pastProfits = results.pastData.map(d => d.profit);
    
    const futureRevenues = results.futureData.map(d => d.revenue);
    const futureCosts = results.futureData.map(d => d.cost);
    const futureProfits = results.futureData.map(d => d.profit);
            
    // 차트 생성
    window.forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allMonths,
            datasets: [
                {
                    label: '매출 (만원)',
                    data: [...pastRevenues, ...futureRevenues],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: function(context) {
                        // 과거 데이터는 실선, 미래 데이터는 점선으로 표시
                        return context.dataIndex < pastMonths.length ? 
                            'rgba(52, 152, 219, 1)' : 'rgba(52, 152, 219, 0.7)';
                    },
                    segment: {
                        borderDash: function(context) {
                            // 미래 부분은 점선으로
                            return context.p1DataIndex >= pastMonths.length ? [6, 6] : undefined;
                        }
                    }
                },
                {
                    label: '비용 (만원)',
                    data: [...pastCosts, ...futureCosts],
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: function(context) {
                        return context.dataIndex < pastMonths.length ? 
                            'rgba(231, 76, 60, 1)' : 'rgba(231, 76, 60, 0.7)';
                    },
                    segment: {
                        borderDash: function(context) {
                            return context.p1DataIndex >= pastMonths.length ? [6, 6] : undefined;
                        }
                    }
                },
                {
                    label: '이익 (만원)',
                    data: [...pastProfits, ...futureProfits],
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: function(context) {
                        return context.dataIndex < pastMonths.length ? 
                            'rgba(46, 204, 113, 1)' : 'rgba(46, 204, 113, 0.7)';
                    },
                    segment: {
                        borderDash: function(context) {
                            return context.p1DataIndex >= pastMonths.length ? [6, 6] : undefined;
                        }
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatNumber(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: true,
                        color: function(context) {
                            if (context.index === pastMonths.length - 0.5) {
                                return 'rgba(128, 128, 128, 0.5)';
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        }
                    }
                }
            }
        }
    });
}

// 재무 요약 생성 함수
function generateFinancialSummary(results) {
    // 1. AsIs 현황 분석
    let asisText = '';
    
    // 과거 데이터 분석 - 다양한 입력 개월 수에 대응하도록 수정
    const firstIndex = 0;
    const lastIndex = results.pastData.length - 1;
    
    // 최소 2개월 이상의 데이터가 있을 때 성장률 계산
    let revenueGrowthRate = "데이터 부족";
    let profitGrowthRate = "데이터 부족";
    
    if (results.pastData.length >= 2) {
        revenueGrowthRate = ((results.pastData[lastIndex].revenue - results.pastData[firstIndex].revenue) / results.pastData[firstIndex].revenue * 100).toFixed(1);
        profitGrowthRate = ((results.pastData[lastIndex].profit - results.pastData[firstIndex].profit) / results.pastData[firstIndex].profit * 100).toFixed(1);
    }
    
    const costRatio = (results.pastAvgCost / results.pastAvgRevenue * 100).toFixed(1);
    const monthCount = results.pastData.length;
    
    asisText += `<p>📈 <strong>매출 현황:</strong> 최근 ${monthCount}개월 평균 매출은 ${formatNumber(results.pastAvgRevenue)}만원이며, 성장률은 ${revenueGrowthRate}%입니다.</p>`;
    asisText += `<p>💰 <strong>수익 현황:</strong> 최근 ${monthCount}개월 평균 이익은 ${formatNumber(results.pastAvgProfit)}만원이며, 평균 수익률은 ${results.pastAvgMarginPercent.toFixed(1)}%입니다.</p>`;
    asisText += `<p>💸 <strong>비용 구조:</strong> 매출 대비 비용 비율은 ${costRatio}%이며, 월 평균 비용은 ${formatNumber(results.pastAvgCost)}만원입니다.</p>`;
    
    // 2. 개선 기회 분석
    let improvementText = '';
    
    // 수익성 분석 및 개선 기회 도출
    const costTrend = results.costRegression.slope > 0 ? "증가" : "감소";
    const revenueTrend = results.revenueRegression.slope > 0 ? "증가" : "감소";
    const marginDifference = results.avgMarginPercent - results.pastAvgMarginPercent;
    
    if (results.revenueRegression.slope <= 0) {
        improvementText += `<p>⚠️ <strong>매출 하락 위험:</strong> 현재 추세로는 매출이 ${revenueTrend}하고 있습니다. 신규 고객 확보 및 마케팅 전략 강화가 필요합니다.</p>`;
    }
    
    if (results.costRegression.slope > 0) {
        improvementText += `<p>⚠️ <strong>비용 관리 필요:</strong> 비용이 ${costTrend}하는 추세입니다. 효율성 개선 및 비용 구조 최적화가 필요합니다.</p>`;
    }
    
    if (marginDifference < 0) {
        improvementText += `<p>⚠️ <strong>수익률 저하:</strong> 미래 예상 수익률(${results.avgMarginPercent.toFixed(1)}%)이 과거(${results.pastAvgMarginPercent.toFixed(1)}%)보다 낮습니다. 가격 전략 및 비용 관리 개선이 필요합니다.</p>`;
    } else {
        improvementText += `<p>✅ <strong>수익률 개선 중:</strong> 미래 예상 수익률(${results.avgMarginPercent.toFixed(1)}%)이 과거(${results.pastAvgMarginPercent.toFixed(1)}%)보다 ${marginDifference.toFixed(1)}% 높아지고 있습니다.</p>`;
    }
    
    // 특정 제품/서비스 고도화 필요성
    improvementText += `<p>🔍 <strong>제품/서비스 개선:</strong> 현재 수익성 지표를 고려할 때, 고부가가치 상품 라인업 강화 및 저수익 상품 최적화가 필요합니다.</p>`;
    
    // 3. ToBe 방향성 제시
    let tobeText = '';
    
    // 정량적 목표 제시
    const targetMarginImprovement = Math.max(5, Math.abs(marginDifference) + 2);
    const targetMargin = (results.avgMarginPercent + targetMarginImprovement).toFixed(1);
    const targetRevenue = (results.totalRevenue * 1.15).toFixed(0);
    
    tobeText += `<p>🎯 <strong>목표 수익률:</strong> 향후 6개월 내 수익률 ${targetMargin}% 달성을 목표로 설정하는 것이 적절합니다.</p>`;
    tobeText += `<p>💰 <strong>매출 목표:</strong> 총 매출 ${formatNumber(targetRevenue)}만원(현재 예측 대비 15% 증가)을 목표로 설정하세요.</p>`;
    
    // 단계별 전략 제시
    tobeText += `<p>📋 <strong>단계별 전략:</strong></p>`;
    tobeText += `<ul>`;
    tobeText += `<li><strong>1단계 (1-2개월):</strong> 비용 구조 최적화 및 핵심 고객 유지 프로그램 강화</li>`;
    tobeText += `<li><strong>2단계 (3-4개월):</strong> 고마진 제품/서비스 라인 확대 및 마케팅 효율성 개선</li>`;
    tobeText += `<li><strong>3단계 (5-6개월):</strong> 신규 시장 확대 및 교차판매 전략 실행</li>`;
    tobeText += `</ul>`;
    
    // 신뢰도에 따른 모니터링 주기 제안
    if (results.confidenceScore < 70) {
        tobeText += `<p>⚠️ <strong>모니터링 강화:</strong> 예측 신뢰도(${results.confidenceScore}/100)가 낮으므로, 2주 단위로 핵심 지표를 점검하고 전략을 조정하세요.</p>`;
    } else {
        tobeText += `<p>✅ <strong>모니터링 계획:</strong> 예측 신뢰도(${results.confidenceScore}/100)가 양호하므로, 월 단위로 핵심 지표를 점검하고 분기별로 전략을 검토하세요.</p>`;
    }
    
    // 요약 내용 삽입
    document.getElementById('asis-analysis').innerHTML = asisText;
    document.getElementById('improvement-opportunities').innerHTML = improvementText;
    document.getElementById('tobe-direction').innerHTML = tobeText;
}
```