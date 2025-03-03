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
                alert(`${i+1}번째 행의 데이터가 올바르지 않습니다. 모든 필