//입력 값 받아서 렌터링 가능한 형태로 데이터 변환 후에 렌터링 실행.
function statement(invoice, plays){    
    return renderPlainText(createStatementData(invoice, plays));
}

// 렌터링 할 수 있는 data 형태로 변경
function createStatementData(invoice, plays){
    const statementData ={};
    statementData.customer = invoice.customer;
    statementData.performances = invoice.performances.map(enrichPerformance);
    statementData.totalAmount = totalAmount(statementData);
    statementData.totalVolumeCredits = totalVolumeCredits(statementData);

    return statementData;

    function enrichPerformance(aPerformance){
        let result = Object.assign({}, aPerformance);
        result.play = playFor(result);
        result.amount = amountFor(result);
        result.volumeCredits = volumeCreditsFor(result);
        return result; //얕은 복사 수행.
    }

    // 공연 추출
    function playFor(aPerformance){
        return plays[aPerformance.playID];
    }

    // 한 공연에 대한 비용 계산 반환
    function amountFor(aPerformance){
        let result = 0;

        switch (aPerformance.play.type){
            case "tragedy":
                result = 40000;
                if( aPerformance.audience > 30){
                    result += 1000 * (aPerformance.audience - 30);
                }
                return result;
            case "comedy":
                result = 30000;
                if( aPerformance.audience > 20){
                    result += 10000 + 500 * (aPerformance.audience - 20);
                }
                result += 300 * aPerformance.audience;
                return result;
            default:
                throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`);
        }

    }

    //적립 포인트 반환
    function volumeCreditsFor(aPerformance){
        let result = Math.max(aPerformance.audience - 30, 0);
        if( "comedy" == aPerformance.play.type) result += Math.floor(aPerformance.audience/5);
        return result;
    }

    // 전체 비용 계산 반환
    function totalAmount(data){
        return data.performances.reduce((total, p)=> total+=p.amount, 0);
    }

    // 전체 적립 포인트 반환 
    function totalVolumeCredits(data){
        return data.performances.reduce((total, p)=> total+= p.volumeCredits, 0);
    }
}

// 출력물 렌터링 함수
function renderPlainText(data){

    let result= `청구 내역 (고객명: ${data.customer})\n`;

    for (let perf of data.performances){
        result += `${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`;
    }

    result += `총액: ${usd(data.totalAmount)}\n`;
    result += `적립 포인트: ${data.totalVolumeCredits}점\n`;
    return result;

      

    // USD 단위 변환 반환 
    function usd(aNumber){
        return new Intl.NumberFormat("en-US", {
            style: "currency", 
            currency: "USD", 
            minimumFractionDigits:2
        }).format(aNumber/100);
    }

}


// 실행 코드 
function testMain(){
    const fs = require('fs');
    const invoices = JSON.parse(fs.readFileSync('./invoices.json', 'utf8'));
    const plays = JSON.parse(fs.readFileSync('./plays.json', 'utf8'));
    let result = statement(invoices[0], plays);

    console.log(result);
}

function testInit(){
    testMain();
}

testInit();