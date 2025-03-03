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

// 동적으로 입력 테이블 생성 함수 (수정: SELECT를 INPUT으로 변경)
function generateInputTable(count, clearValues = false) {
    const tableBody = document.getElementById('input-table-body');
    tableBody.innerHTML = ''; // 기존 행 초기화
    
    const koreanMonths = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    
    for (let i = 0; i < count; i++) {
        const row = document.createElement('tr');
        
        // 월 입력 셀 - SELECT에서 INPUT으로 변경
        const monthCell = document.createElement('td');
        monthCell.className = 'input-cell';
        
        const monthInput = document.createElement('input');
        monthInput.type = 'text';
        monthInput.id = `month-input-${i}`;
        monthInput.className = 'month-input';
        
        // 기본값 설정 (내림차순: 최근 월부터 과거로)
        const monthIndex = (currentMonth - i + 12) % 12;
        if (!clearValues) {
            monthInput.value = koreanMonths[monthIndex];
        }
        
        monthInput.placeholder = '월 입력 (예: 1월)';
        
        monthCell.appendChild(monthInput);
        row.appendChild(monthCell);
        
        // 매출 입력 셀
        const revenueCell = document.createElement('td');
        revenueCell.className = 'input-cell';
        
        const revenueInput = document.createElement('input');
        revenueInput.type = 'number';
        revenueInput.id = `revenue-input-${i}`;
        revenueInput.className = 'revenue-input';
        revenueInput.placeholder = `예: ${1000 - i * 50}`;
        
        if (!clearValues) {
            revenueInput.value = 1000 - i * 50;
        }
        
        revenueCell.appendChild(revenueInput);
        row.appendChild(revenueCell);
        
        // 비용 입력 셀
        const costCell = document.createElement('td');
        costCell.className = 'input-cell';
        
        const costInput = document.createElement('input');
        costInput.type = 'number';
        costInput.id = `cost-input-${i}`;
        costInput.className = 'cost-input';
        costInput.placeholder = `예: ${700 - i * 30}`;
        
        if (!clearValues) {
            costInput.value = 700 - i * 30;
        }
        
        costCell.appendChild(costInput);
        row.appendChild(costCell);
        
        // 행 추가
        tableBody.appendChild(row);
    }
}

// 엑셀 붙여넣기 데이터 처리 함수 (개선: 다양한 형식 처리)
function processPasteData() {
    const pasteContent = document.getElementById('excel-paste-area').innerText.trim();
    
    if (pasteContent === '' || pasteContent === '여기에 엑셀 데이터를 붙여넣으세요...') {
        alert('붙여넣을 데이터가 없습니다.');
        return;
    }
    
    try {
        // 붙여넣은 데이터 파싱 (개선: 다양한 구분자 처리)
        const rows = pasteContent.split(/\r\n|\n/);
        const data = [];
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row === '') continue;
            
            // 탭이나 여러 공백으로 분리된 데이터 처리 (개선: 다양한 구분자 인식)
            let columns;
            
            // 탭, 콤마, 세미콜론 또는 여러 공백으로 구분된 데이터 처리
            if (row.includes('\t')) {
                columns = row.split('\t');
            } else if (row.includes(',')) {
                columns = row.split(',');
            } else if (row.includes(';')) {
                columns = row.split(';');
            } else {
                columns = row.split(/\s{2,}/); // 2개 이상의 공백으로 구분
            }
            
            if (columns.length < 2) {
                // 단일 공백으로 분리 시도
                columns = row.split(' ');
            }
            
            if (columns.length < 2) {
                // 처리할 수 없는 형식의 경우 경고
                alert('데이터 형식이 올바르지 않습니다. 엑셀에서 [월, 매출, 비용] 순서로 데이터를 복사해주세요.');
                return;
            }
            
            // 월, 매출, 비용 데이터 추출 (개선: 더 유연한 데이터 처리)
            const month = columns[0].trim();
            
            // 숫자 파싱 개선 (콤마 및 기타 서식 제거)
            let revenue = columns[1].trim().replace(/[^\d.-]/g, '');
            let cost = '0';
            
            if (columns.length >= 3) {
                cost = columns[2].trim().replace(/[^\d.-]/g, '');
            }
            
            revenue = parseFloat(revenue);
            cost = parseFloat(cost);
            
            if (isNaN(revenue)) {
                alert(`${i+1}번째 행의 매출 데이터가 올바르지 않습니다. 숫자 형식을 확인해주세요.`);
                return;
            }
            
            if (isNaN(cost)) {
                // 비용 데이터가 없거나 올바르지 않은 경우 0으로 설정
                cost = 0;
            }
            
            data.push({
                month: month,
                revenue: revenue,
                cost: cost
            });
        }
        
        // 데이터가 없는 경우 처리
        if (data.length === 0) {
            alert('처리할 데이터가 없습니다.');
            return;
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

// 데이터로 테이블 채우기 함수 (수정: SELECT에서 INPUT으로 변경됨에 따라 수정)
function fillTableWithData(data) {
    for (let i = 0; i < data.length; i++) {
        const monthInput = document.getElementById(`month-input-${i}`);
        const revenueInput = document.getElementById(`revenue-input-${i}`);
        const costInput = document.getElementById(`cost-input-${i}`);
        
        if (monthInput && revenueInput && costInput) {
            monthInput.value = data[i].month;
            revenueInput.value = data[i].revenue;
            costInput.value = data[i].cost;
        }
    }
}

// 숫자 포맷팅 함수
function formatNumber(num) {
    return Math.round(num).toLocaleString('ko-KR');
}

// 예측 계산 및 표시 (수정: SELECT에서 INPUT으로 변경됨에 따라 수정)
function calculateForecast() {
    try {
        // 입력 데이터 수집
        const pastData = [];
        
        // 현재 입력 테이블의 행 수
        const rows = document.getElementById('input-table-body').getElementsByTagName('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const monthInput = document.getElementById(`month-input-${i}`);
            const revenueInput = document.getElementById(`revenue-input-${i}`);
            const costInput = document.getElementById(`cost-input-${i}`);
            
            // 존재 확인
            if (!monthInput || !revenueInput || !costInput) {
                alert(`${i+1}번째 행의 입력 필드를 찾을 수 없습니다.`);
                return;
            }
            
            const monthName = monthInput.value;
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

// 나머지 함수들은 동일하게 유지...
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
    window.fore