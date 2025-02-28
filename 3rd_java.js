// 재무 요약 생성 함수
        function generateFinancialSummary(results) {
            // 1. AsIs 현황 분석
            let asisText = '';
            
            // 과거 데이터 분석
            const revenueGrowthRate = ((results.pastData[2].revenue - results.pastData[0].revenue) / results.pastData[0].revenue * 100).toFixed(1);
            const profitGrowthRate = ((results.pastData[2].profit - results.pastData[0].profit) / results.pastData[0].profit * 100).toFixed(1);
            const costRatio = (results.pastAvgCost / results.pastAvgRevenue * 100).toFixed(1);
            
            asisText += `<p>📈 <strong>매출 현황:</strong> 최근 3개월 평균 매출은 ${formatNumber(results.pastAvgRevenue)}만원이며, 성장률은 ${revenueGrowthRate}%입니다.</p>`;
            asisText += `<p>💰 <strong>수익 현황:</strong> 최근 3개월 평균 이익은 ${formatNumber(results.pastAvgProfit)}만원이며, 평균 수익률은 ${results.pastAvgMarginPercent.toFixed(1)}%입니다.</p>`;
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
    </script>
</body>
</html>
