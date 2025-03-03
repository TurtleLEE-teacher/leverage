document.addEventListener('DOMContentLoaded', function() {
    // 초기화 함수 호출
    initializeApp();
});

function initializeApp() {
    // 버튼 이벤트 리스너 설정
    document.getElementById('apply-row-count').addEventListener('click', updateTableRows);
    document.getElementById('clear-table').addEventListener('click', clearTable);
    document.getElementById('paste-example').addEventListener('click', pasteExampleData);
    document.getElementById('process-paste').addEventListener('click', processPastedData);
    document.getElementById('calculate-btn').addEventListener('click', calculateForecast);

    // 초기 월 선택 이벤트 리스너 설정
    setupMonthChangeListeners();
    
    // [변경 1] 페이지 로드 시 초기 월 순서 설정 (기본값이 제대로 표시되도록)
    setTimeout(() => {
        updateMonthsInDescendingOrder(0);
    }, 0);
}

// 표 크기 변경 기능 수정 (요구사항 1: 표크기적용 불가 수정)
function updateTableRows() {
    const rowCount = parseInt(document.getElementById('row-count').value);
    const tableBody = document.getElementById('input-table-body');
    
    // 현재 행 수 확인
    const currentRowCount = tableBody.children.length;
    
    if (rowCount > currentRowCount) {
        // 행 추가
        for (let i = currentRowCount; i < rowCount; i++) {
            addNewRow(i);
        }
    } else if (rowCount < currentRowCount) {
        // 행 삭제
        for (let i = currentRowCount - 1; i >= rowCount; i--) {
            tableBody.removeChild(tableBody.children[i]);
        }
    }
    
    // [변경 2] setTimeout으로 DOM 업데이트 후 월 순서 설정 보장
    setTimeout(() => {
        // 월 순서 자동 설정
        updateMonthsInDescendingOrder(0);
        
        // 월 변경 이벤트 리스너 다시 설정
        setupMonthChangeListeners();
    }, 0);
}

// 새 행 추가 함수
function addNewRow(index) {
    const tableBody = document.getElementById('input-table-body');
    const newRow = document.createElement('tr');
    
    // 월 선택 셀 생성
    const monthCell = document.createElement('td');
    monthCell.className = 'input-cell';
    const monthSelect = document.createElement('select');
    monthSelect.className = 'month-input';
    monthSelect.id = `month-input-${index}`;
    
    // 월 옵션 추가
    for (let m = 1; m <= 12; m++) {
        const option = document.createElement('option');
        option.value = `${m}월`;
        option.textContent = `${m}월`;
        monthSelect.appendChild(option);
    }
    
    // [변경 3] 기본 월 설정 방식 개선 - 명시적으로 월 선택
    // 기존 코드에서는 이 부분에서 월이 제대로 설정되지 않을 수 있음
    if (index > 0) {
        const prevSelect = document.getElementById(`month-input-${index-1}`);
        let prevMonth = 3; // 기본값
        
        if (prevSelect && prevSelect.value) {
            prevMonth = parseInt(prevSelect.value);
        }
        
        let newMonth = (prevMonth === 1) ? 12 : prevMonth - 1;
        monthSelect.value = `${newMonth}월`;
    } else {
        monthSelect.value = '3월'; // 첫 번째 행의 기본값
    }
    
    monthCell.appendChild(monthSelect);
    newRow.appendChild(monthCell);
    
    // 매출 입력 셀 생성 (요구사항 3: 매출 및 비용 기본값 설정)
    const revenueCell = document.createElement('td');
    revenueCell.className = 'input-cell';
    const revenueInput = document.createElement('input');
    revenueInput.type = 'number';
    revenueInput.className = 'revenue-input';
    revenueInput.id = `revenue-input-${index}`;
    revenueInput.value = 1000 - (index * 50); // 기본값 설정: 첫행 1000, 이후 50씩 감소
    revenueCell.appendChild(revenueInput);
    newRow.appendChild(revenueCell);
    
    // 비용 입력 셀 생성
    const costCell = document.createElement('td');
    costCell.className = 'input-cell';
    const costInput = document.createElement('input');
    costInput.type = 'number';
    costInput.className = 'cost-input';
    costInput.id = `cost-input-${index}`;
    costInput.value = 700 - (index * 30); // 기본값 설정: 첫행 700, 이후 30씩 감소
    costCell.appendChild(costInput);
    newRow.appendChild(costCell);
    
    tableBody.appendChild(newRow);
}

// 월 변경 이벤트 리스너 설정
function setupMonthChangeListeners() {
    const monthSelects = document.querySelectorAll('.month-input');
    
    monthSelects.forEach((select, index) => {
        // 기존 이벤트 리스너 제거 (중복 방지)
        select.removeEventListener('change', monthChangeHandler);
        
        // 새 이벤트 리스너 추가
        select.addEventListener('change', monthChangeHandler);
    });
}

// 월 변경 핸들러 함수
function monthChangeHandler(event) {
    const selects = document.querySelectorAll('.month-input');
    const changedIndex = Array.from(selects).indexOf(event.target);
    updateMonthsInDescendingOrder(changedIndex);
}

// [변경 4] 월을 내림차순으로 자동 설정하는 함수 수정 - 파싱 오류 방지
function updateMonthsInDescendingOrder(changedIndex) {
    const monthSelects = document.querySelectorAll('.month-input');
    
    // 첫 번째 월이 설정되지 않은 경우 기본값 설정
    if (!monthSelects[changedIndex].value) {
        monthSelects[changedIndex].value = changedIndex === 0 ? '3월' : 
                                          (changedIndex === 1 ? '2월' : '1월');
    }
    
    // 변경된 월 추출 (숫자만)
    const selectedMonthValue = monthSelects[changedIndex].value;
    const selectedMonthNum = parseInt(selectedMonthValue);
    
    // 하위 행들의 월 업데이트 (내림차순)
    for (let i = changedIndex + 1; i < monthSelects.length; i++) {
        const prevMonthNum = parseInt(monthSelects[i-1].value);
        let newMonth = isNaN(prevMonthNum) ? (13 - i) : ((prevMonthNum === 1) ? 12 : prevMonthNum - 1);
        monthSelects[i].value = `${newMonth}월`;
    }
    
    // 상위 행들의 월 업데이트 (오름차순)
    for (let i = changedIndex - 1; i >= 0; i--) {
        const nextMonthNum = parseInt(monthSelects[i+1].value);
        let newMonth = isNaN(nextMonthNum) ? (3 - i) : ((nextMonthNum === 12) ? 1 : nextMonthNum + 1);
        monthSelects[i].value = `${newMonth}월`;
    }
    
    // [변경 5] 디버깅용 로그 (필요시 주석 해제)
    // console.log('월 설정 완료:', Array.from(monthSelects).map(s => s.value));
}

// [변경 6] 입력값 초기화 함수 개선 - 타이밍 문제 해결
function clearTable() {
    const rowCount = parseInt(document.getElementById('row-count').value);
    const tableBody = document.getElementById('input-table-body');
    
    // 테이블 비우기
    tableBody.innerHTML = '';
    
    // 기본 행 생성
    for (let i = 0; i < rowCount; i++) {
        addNewRow(i);
    }
    
    // DOM 업데이트 후 값을 설정하기 위해 setTimeout 사용
    setTimeout(() => {
        // 월 내림차순 설정
        updateMonthsInDescendingOrder(0);
        
        // 각 입력 필드에 명시적으로 값 설정
        for (let i = 0; i < rowCount; i++) {
            const monthSelect = document.getElementById(`month-input-${i}`);
            const revenueInput = document.getElementById(`revenue-input-${i}`);
            const costInput = document.getElementById(`cost-input-${i}`);
            
            // 월 기본값: 3월, 2월, 1월... 순서
            if (monthSelect) {
                const monthValue = i === 0 ? '3월' : (i === 1 ? '2월' : (i === 2 ? '1월' : 
                                  `${(13 - i) > 0 ? (13 - i) : 1}월`));
                monthSelect.value = monthValue;
            }
            
            // 매출 및 비용 기본값 재설정
            if (revenueInput) revenueInput.value = 1000 - (i * 50);
            if (costInput) costInput.value = 700 - (i * 30);
        }
        
        // 월 변경 이벤트 리스너 다시 설정
        setupMonthChangeListeners();
    }, 10); // 약간의 지연을 두어 DOM이 업데이트될 시간 제공
    
    // 결과 섹션 숨기기
    document.getElementById('results').style.display = 'none';
}

// 샘플 데이터 입력 함수
function pasteExampleData() {
    // 기존 샘플 데이터 입력 로직
    // 예시 데이터 형태에 따라 구현...
    
    // 결과 표시를 위한 계산 트리거
    calculateForecast();
}

// 붙여넣은 데이터 처리 함수
function processPastedData() {
    const pasteArea = document.getElementById('excel-paste-area');
    const pasteContent = pasteArea.innerText.trim();
    
    if (pasteContent === '' || pasteContent === '여기에 엑셀 데이터를 붙여넣으세요...') {
        alert('붙여넣을 데이터가 없습니다.');
        return;
    }
    
    // 데이터 행으로 분리
    const rows = pasteContent.split('\n');
    const rowCount = rows.length;
    
    // 행 수 업데이트
    document.getElementById('row-count').value = Math.min(12, rowCount); // 최대 12개월로 제한
    updateTableRows();
    
    // [변경 7] 붙여넣기 데이터 처리 후 타이밍 문제 해결
    setTimeout(() => {
        // 데이터 채우기
        rows.forEach((row, index) => {
            if (index >= 12) return; // 최대 12행까지만 처리
            
            const columns = row.split('\t');
            if (columns.length >= 3) {
                // 월 설정
                const monthInput = document.getElementById(`month-input-${index}`);
                if (monthInput) monthInput.value = columns[0];
                
                // 매출 설정
                const revenueInput = document.getElementById(`revenue-input-${index}`);
                if (revenueInput) revenueInput.value = columns[1];
                
                // 비용 설정
                const costInput = document.getElementById(`cost-input-${index}`);
                if (costInput) costInput.value = columns[2];
            }
        });
        
        // 월 순서 자동 설정
        updateMonthsInDescendingOrder(0);
        
        // 결과 계산 트리거
        calculateForecast();
    }, 10);
}

// 입력 데이터 수집 함수
function getInputData() {
    const months = [];
    const revenues = [];
    const costs = [];
    
    const rows = document.getElementById('input-table-body').children;
    
    for (let i = 0; i < rows.length; i++) {
        const monthSelect = rows[i].querySelector('.month-input');
        const revenueInput = rows[i].querySelector('.revenue-input');
        const costInput = rows[i].querySelector('.cost-input');
        
        if (!monthSelect || !revenueInput || !costInput) continue;
        
        const month = monthSelect.value;
        const revenue = parseFloat(revenueInput.value);
        const cost = parseFloat(costInput.value);
        
        if (!month || isNaN(revenue) || isNaN(cost)) continue;
        
        months.push(month);
        revenues.push(revenue);
        costs.push(cost);
    }
    
    return { months, revenues, costs };
}

// 예측 계산 함수 (요구사항 5: 수동데이터 입력시 결과값 나오도록 반영)
function calculateForecast() {
    // 입력 데이터 수집
    const inputData = getInputData();
    
    if (inputData.months.length < 2) {
        alert('최소 2개월 이상의 데이터를 입력해주세요.');
        return;
    }
    
    // 기본 데이터 준비
    const months = inputData.months;
    const revenues = inputData.revenues;
    const costs = inputData.costs;
    
    // 기존 데이터 분석 및 트렌드 계산
    const revenueGrowthRates = [];
    const costGrowthRates = [];
    
    for (let i = 1; i < revenues.length; i++) {
        const revenueGrowth = (revenues[i-1] - revenues[i]) / revenues[i];
        const costGrowth = (costs[i-1] - costs[i]) / costs[i];
        revenueGrowthRates.push(revenueGrowth);
        costGrowthRates.push(costGrowth);
    }
    
    // 평균 성장률 계산
    const avgRevenueGrowth = revenueGrowthRates.reduce((a, b) => a + b, 0) / revenueGrowthRates.length;
    const avgCostGrowth = costGrowthRates.reduce((a, b) => a + b, 0) / costGrowthRates.length;
    
    // 예측 데이터 생성 (향후 6개월)
    const forecastMonths = [];
    const forecastRevenues = [];
    const forecastCosts = [];
    const forecastProfits = [];
    const forecastMargins = [];
    
    // 첫 번째 월은 가장 최근 데이터
    let lastMonth = parseInt(months[0]);
    let lastRevenue = revenues[0];
    let lastCost = costs[0];
    
    for (let i = 0; i < 6; i++) {
        // 다음 월 계산
        lastMonth = (lastMonth % 12) + 1;
        forecastMonths.push(`${lastMonth}월`);
        
        // 다음 매출 및 비용 예측
        lastRevenue = lastRevenue * (1 + avgRevenueGrowth);
        lastCost = lastCost * (1 + avgCostGrowth);
        
        forecastRevenues.push(Math.round(lastRevenue));
        forecastCosts.push(Math.round(lastCost));
        
        // 이익 및 수익률 계산
        const profit = lastRevenue - lastCost;
        const margin = (profit / lastRevenue) * 100;
        
        forecastProfits.push(Math.round(profit));
        forecastMargins.push(Math.round(margin * 10) / 10); // 소수점 한 자리
    }
    
    // 결과 표시
    displayResults(forecastMonths, forecastRevenues, forecastCosts, forecastProfits, forecastMargins);
    
    // 차트 그리기
    drawChart(forecastMonths, forecastRevenues, forecastCosts, forecastProfits);
    
    // 요약 생성
    generateSummary(months, revenues, costs, forecastMonths, forecastRevenues, forecastCosts, forecastProfits, forecastMargins);
    
    // 결과 섹션 표시
    document.getElementById('results').style.display = 'block';
}

// 결과 표시 함수
function displayResults(months, revenues, costs, profits, margins) {
    // 메트릭 카드 업데이트
    const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
    const totalRevenue = revenues.reduce((a, b) => a + b, 0);
    const totalProfit = profits.reduce((a, b) => a + b, 0);
    
    document.getElementById('avg-profit-margin').textContent = `${avgMargin.toFixed(1)}%`;
    document.getElementById('total-revenue').textContent = `${totalRevenue.toLocaleString()} 만원`;
    document.getElementById('total-profit').textContent = `${totalProfit.toLocaleString()} 만원`;
    
    // 신뢰도 점수 계산 (간단한 예시)
    const confidenceScore = Math.min(95, 60 + (margins.length * 5));
    document.getElementById('confidence-score').textContent = `${confidenceScore}%`;
    
    // 결과 테이블 업데이트
    const tableBody = document.getElementById('results-table-body');
    tableBody.innerHTML = '';
    
    for (let i = 0; i < months.length; i++) {
        const row = document.createElement('tr');
        
        const monthCell = document.createElement('td');
        monthCell.textContent = months[i];
        row.appendChild(monthCell);
        
        const revenueCell = document.createElement('td');
        revenueCell.textContent = revenues[i].toLocaleString();
        row.appendChild(revenueCell);
        
        const costCell = document.createElement('td');
        costCell.textContent = costs[i].toLocaleString();
        row.appendChild(costCell);
        
        const profitCell = document.createElement('td');
        profitCell.textContent = profits[i].toLocaleString();
        row.appendChild(profitCell);
        
        const marginCell = document.createElement('td');
        marginCell.textContent = `${margins[i].toFixed(1)}%`;
        row.appendChild(marginCell);
        
        tableBody.appendChild(row);
    }
}

// 차트 그리기 함수
function drawChart(months, revenues, costs, profits) {
    const ctx = document.getElementById('forecast-chart').getContext('2d');
    
    // 기존 차트 제거
    if (window.forecastChart) {
        window.forecastChart.destroy();
    }
    
    // 새 차트 생성
    window.forecastChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: '예상 매출 (만원)',
                    data: revenues,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: '예상 비용 (만원)',
                    data: costs,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: '예상 이익 (만원)',
                    data: profits,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 요약 생성 함수
function generateSummary(pastMonths, pastRevenues, pastCosts, forecastMonths, forecastRevenues, forecastCosts, forecastProfits, forecastMargins) {
    // 현재 상태 분석
    const pastProfits = pastRevenues.map((revenue, i) => revenue - pastCosts[i]);
    const pastMargins = pastProfits.map((profit, i) => (profit / pastRevenues[i]) * 100);
    
    const avgPastMargin = pastMargins.reduce((a, b) => a + b, 0) / pastMargins.length;
    const avgForecastMargin = forecastMargins.reduce((a, b) => a + b, 0) / forecastMargins.length;
    
    const revenueChange = (forecastRevenues[5] - forecastRevenues[0]) / forecastRevenues[0] * 100;
    const marginChange = forecastMargins[5] - forecastMargins[0];
    
    // AsIs 현황 요약
    document.getElementById('asis-analysis').innerHTML = `
        <p>과거 ${pastMonths.length}개월 데이터 기준 평균 수익률은 <strong>${avgPastMargin.toFixed(1)}%</strong>입니다.</p>
        <p>매출은 ${pastRevenues[0] > pastRevenues[pastRevenues.length-1] ? '상승' : '하락'} 추세를 보이고 있으며, 
        비용은 ${pastCosts[0] > pastCosts[pastCosts.length-1] ? '상승' : '하락'} 추세를 보입니다.</p>
    `;
    
    // 개선기회 요약
    document.getElementById('improvement-opportunities').innerHTML = `
        <p>향후 6개월 수익률 추세는 ${marginChange > 0 ? '상승' : '하락'} 추세가 예상됩니다. 
        ${marginChange < 0 ? '<strong>비용 효율화가 필요합니다.</strong>' : ''}</p>
        <p>특히 ${forecastMargins.indexOf(Math.min(...forecastMargins)) + 1}번째 달에 수익률이 가장 낮을 것으로 예상되므로 주의가 필요합니다.</p>
    `;
    
    // ToBe 방향성 요약
    document.getElementById('tobe-direction').innerHTML = `
        <p>향후 6개월 동안 매출은 ${revenueChange > 0 ? '약 ' + revenueChange.toFixed(1) + '% 상승할' : '약 ' + Math.abs(revenueChange).toFixed(1) + '% 하락할'} 것으로 예상됩니다.</p>
        <p>수익성 개선을 위해 ${forecastCosts[0] > 1000 ? '비용 절감' : '매출 증대'} 전략에 집중하는 것이 효과적일 것으로 보입니다.</p>
        <p>평균 수익률 목표를 ${(avgForecastMargin + 5).toFixed(1)}%로 설정하고 운영하는 것을 권장합니다.</p>
    `;
}