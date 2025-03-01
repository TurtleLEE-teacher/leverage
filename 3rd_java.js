// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 현재 날짜 정보 가져오기
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    
    // 초기 개월 수 (기본값: 3개월)
    let monthCount = 3;
    
    // 월 입력 필드 생성 함수 호출
    generateMonthInputs(monthCount);
    
    // 개월 수 변경 버튼 이벤트 설정
    document.getElementById('apply-month-count').addEventListener('click', function() {
        const newMonthCount = parseInt(document.getElementById('month-count').value);
        monthCount = newMonthCount;
        generateMonthInputs(newMonthCount);
    });
    
    // 계산 버튼 클릭 이벤트 설정
    document.getElementById('calculate-btn').addEventListener('click', calculateForecast);
});

// 동적으로 월 입력 필드 생성 함수
function generateMonthInputs(count) {
    const container = document.getElementById('dynamic-inputs');
    container.innerHTML = ''; // 기존 입력 필드 초기화
    
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const koreanMonths = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    
    // 과거부터 최근까지 입력 필드 생성 (가장 오래된 데이터부터)
    for (let i = count; i >= 1; i--) {
        // 해당 개월 전의 월 계산
        const monthIndex = (currentMonth - i + 1 + 12) % 12;
        
        // 입력 필드 컨테이너 생성
        const monthInputDiv = document.createElement('div');
        monthInputDiv.className = 'month-input';
        
        // 개월 레이블 표시 (몇 개월 전인지)
        const monthLabel = i === 1 ? '1개월 전' : `${i}개월 전`;
        
        // HTML 내용 생성
        monthInputDiv.innerHTML = `
            <h3>🔍 ${monthLabel}</h3>
            <label for="month${i}-select">월 선택:</label>
            <select id="month${i}-select">
                ${koreanMonths.map((month, idx) => 
                    `<option value="${month}" ${idx === monthIndex ? 'selected' : ''}>${month}</option>`
                ).join('')}
            </select>
            <label for="month${i}-revenue">매출:</label>
            <span class="unit-label">단위: 만원 💰</span>
            <input type="number" id="month${i}-revenue" placeholder="예: ${900 + (i-1)*50}">
            <label for="month${i}-cost">비용:</label>
            <span class="unit-label">단위: 만원 💸</span>
            <input type="number" id="month${i}-cost" placeholder="예: ${600 + (i-1)*50}">
        `;
        
        // 컨테이너에 추가
        container.appendChild(monthInputDiv);
    }
    
    // 샘플 데이터 설정 (기본값)
    for (let i = count; i >= 1; i--) {
        const revValue = 900 + (count - i) * 50;
        const costValue = 600 + (count - i) * 50;
        
        document.getElementById(`month${i}-revenue`).value = revValue;
        document.getElementById(`month${i}-cost`).value = costValue;
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
        
        // 현재 입력 필드 수 확인
        const monthInputs = document.querySelectorAll('.month-input').length;
        
        for (let i = monthInputs; i >= 1; i--) { // 가장 오래된 데이터부터 최근 데이터까지 (과거 순서대로)
            const monthName = document.getElementById(`month${i}-select`).value;
            const revenue = parseFloat(document.getElementById(`month${i}-revenue`).value);
            const cost = parseFloat(document.getElementById(`month${i}-cost`).value);
            
            if (!monthName || isNaN(revenue) || isNaN(cost)) {
                alert("모든 입력 필드를 올바르게 채워주세요.");
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
