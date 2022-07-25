// This is an example algorithm

// function getPositions(instId) {
//   var data = E.GetPositions(instId)
//   return data;
// }

//  近5根k线只有一张触碰到k布林通道，则不继续下单，近5根k先有两根k线触碰到布林k线，且后一根最低价比前一根触碰到价更适合，且2根收盘价一定在布林线内，第三根再碰到布林线才开单
function decideWithLong(fullTickets, boll, offsetPrice) {
    // posSide long 或 short
    var size = 7;
    var funllSize = fullTickets.length;
    var tickets = fullTickets.slice(funllSize - size)
    var lower = boll.lower.slice(funllSize - size);
    var middle = boll.middle.slice(funllSize - size);

    var count = 0;
    var map = {};
    var arr = [];
    for (var i = 0; i < size - 1; i++) {
        //  {"Time":1653043800,"Open":30310,"High":30314.3,"Low":30278.1,"Close":30284.5,"Volume":5061}
        if (tickets[i].Low <= lower[i]) {
            count++;
            arr.push(i);
            map[i] = tickets[i];
        }
    }

    //  前4根没有破布林线
    if (count === 0) {
        return "OK";
    }

    // 不包括最新k线，前4条中有2条触碰到boll轨道
    if (count === 1) {
        var k0 = arr[0];
        var ticket0 = map[k0];
        var current = tickets[size - 1];
        if (
            ticket0.Low < lower[k0] &&
            ticket0.Close > lower[k0] &&
            ticket0.Close > (ticket0.Open - offsetPrice) &&
            current.Low > ticket0.Low &&
            current.Close > ticket0.Low
        ) {
            return "OK";
        }
    } else {
        return "NO";
    }
}


//  近5根k线只有一张触碰到k布林通道，则不继续下单，近5根k先有两根k线触碰到布林k线，且后一根最低价比前一根触碰到价更适合，且2根收盘价一定在布林线内，第三根再碰到布林线才开单
function decideWithShort(fullTickets, boll, offsetPrice) {
    // posSide long 或 short
    var size = 7;
    var funllSize = fullTickets.length;
    var tickets = fullTickets.slice(funllSize - size)
    var upper = boll.upper.slice(funllSize - size);
    var middle = boll.middle.slice(funllSize - size);

    var count = 0;
    var map = {};
    var arr = [];
    for (var i = 0; i < size - 1; i++) {
        //  {"Time":1653043800,"Open":30310,"High":30314.3,"Low":30278.1,"Close":30284.5,"Volume":5061}
        if (tickets[i].High >= upper[i]) {
            count++;
            arr.push(i);
            map[i] = tickets[i];
        }
    }
    //  前4根没有破布林线
    if (count === 0) {
        return "OK";
    }


    // 包括最新k线，有3条触碰到boll轨道，ticket1是最新的k线
    if (count === 1) {
        var k0 = arr[0];
        var ticket0 = map[k0];
        var current = tickets[size - 1];
        // var cha = ticket0.Open - ticket0.Close;
        // var n = Math.abs(cha)

        if (
            ticket0.Close < upper[k0] &&
            ticket0.High > upper[k0] &&
            //  这里改成比值，主要是压力或者支撑位存在T线
            ticket0.Close < (ticket0.Open + offsetPrice) &&
            current.High < ticket0.High &&
            current.Close < ticket0.High
        ) {
            return "OK";
        }
    } else {
        return "NO";
    }
}

function computerBigDirection(instId, dayPeriod) {
    var dayTickets = Okex.GetKlineRecords(instId, dayPeriod, {
        limit: 30
    });

    if (!dayTickets) {
        G.Log("get dayTickets error");
        return { direction: "error" }
    }

    if (!dayTickets.length) {
        //  time -1保证下次进循环继续获取boolTickets，一直知道获取到boolTickets
        G.Log("dayTickets is Empty");
        return { direction: "error" }
    }

    var dayCloseTicket = dayTickets.map(function (item) {
        return item.Close;
    });

    var emaLines = Talib.Ma(dayCloseTicket, 20, 1)
    var size = 5;
    var funllSize = emaLines.length;
    var emaLines5 = emaLines.slice(funllSize - size)
    G.Log(JSON.stringify(emaLines5));
    var front = emaLines5[5 - 1];
    var tail = emaLines5[0]
    var emaRate = (front - tail) / front;
    G.Log("emaRate", emaRate);
    //  定义为日线级别下跌行情，只能小级别小空单
    if (emaRate > -0.02 && emaRate < 0.02) {
        return {
            direction: "short&&long"
        }
    }

    return {
        direction: "error"
    }
}

function main() {
    var sz = 1;
    var offsetPriceRate = 0.1;
    var instId = "BTC-USDT-SWAP";
    var boolPeriod = 10;
    var directionPeriod = 10;
    var pingOrderId = 0;
    var lastReqDayTime = +new Date();
    var dayDecide = computerBigDirection(instId, directionPeriod);
    G.Log(dayDecide);

    var orderInfo = {
        orderId: 0,
        posSide: "",
        //  通过时间衡量，3根bar之类不要连续开单，假设
        lastOrderTime: 0,
        tpTriggerPx: 0,
        slTriggerPx: 0,// 止损
    }

    G.Log("开始监控下单");

    for (; ;) {
        var reqDayTime = +new Date();
        if (reqDayTime - lastReqDayTime > 5 * 60 * 1000) {
            lastReqDayTime = reqDayTime;
            dayDecide = computerBigDirection(instId, directionPeriod);
            G.Log(dayDecide);
        }

        var boolTickets = Okex.GetKlineRecords(instId, boolPeriod, {
            limit: 30
        });
        if (!boolTickets) {
            //  time -1保证下次进循环继续获取boolTickets，一直知道获取到boolTickets
            G.Log("get boolTickets error");
            G.Sleep(1000);
            continue;
        }

        if (!boolTickets.length) {
            //  time -1保证下次进循环继续获取boolTickets，一直知道获取到boolTickets
            G.Log("boolTickets is Empty");
            G.Sleep(1000);
            continue;
        }

        var closeTicket = boolTickets.map(function (item) {
            return item.Close;
        });

        var size = boolTickets.length;
        var bool = Talib.Bool(closeTicket, 20);
        var currentTicket = boolTickets[size - 1];
        var price = currentTicket.Close;

        var lower = bool.lower[size - 1];
        var middle = bool.middle[size - 1];
        var upper = bool.upper[size - 1];
        var buyProfit = middle - lower;
        var sellProfit = upper - middle;
        G.Console("price", price, "lower", lower, "middle", middle, "upper", upper);

        //  止盈，买入平空
        if (
            orderInfo.orderId !== 0 &&
            orderInfo.posSide === "short" &&
            price <= middle
        ) {
            G.Log("止盈，买入平空", 1)
            pingOrderId = Okex.Trade({
                instId: instId,
                tdMode: "cross",
                side: 'buy',
                posSide: "short",
                ordType: "limit",
                px: orderInfo.tpTriggerPx + 100,
                sz: sz
            })
        } else if (
            //  止损，买入平空
            orderInfo.orderId !== 0 &&
            orderInfo.posSide === "short" &&
            price >= orderInfo.slTriggerPx
        ) {
            G.Log("止损，买入平空", 2)
            pingOrderId = Okex.Trade({
                instId: instId,
                tdMode: "cross",
                side: 'buy',
                posSide: "short",
                ordType: "limit",
                px: orderInfo.slTriggerPx + 100,
                sz: sz
            })
        }

        //29857.6
        //{"lastOrderTime":1654351200000,"orderId":"453318613959880712","posSide":"long","slTriggerPx":29428.615370031737,"tpTriggerPx":29645.52807400634}
        //  卖出平多
        if (
            orderInfo.orderId !== 0 &&
            orderInfo.posSide === "long" &&
            price >= middle
        ) {
            G.Log("卖出平多", 3)
            pingOrderId = Okex.Trade({
                instId: instId,
                tdMode: "cross",
                side: 'sell',
                posSide: "long",
                ordType: "limit",
                px: orderInfo.tpTriggerPx - 100,
                sz: sz
            })
        } else if (
            orderInfo.orderId !== 0 &&
            orderInfo.posSide === "long" &&
            price <= orderInfo.slTriggerPx
        ) {
            G.Log("卖出平多", 4)
            pingOrderId = Okex.Trade({
                instId: instId,
                tdMode: "cross",
                side: 'sell',
                posSide: "long",
                ordType: "limit",
                px: orderInfo.slTriggerPx - 100,
                sz: sz
            })
        }

        if (!!pingOrderId) {
            G.Log("已平仓,重置pingOrderId为空");
            orderInfo.orderId = 0;
            orderInfo.posSide = "";
            orderInfo.tpTriggerPx = 0;
            orderInfo.slTriggerPx = 0;
            orderInfo.lastOrderTime = currentTicket.Time;
            pingOrderId = 0;
        }

        //  盈亏比条件过滤（后面加）

        //  需要关注止盈止损单子状态跟新，最后所有下单的平仓操作交给策略下单止盈止损去做，只要实时更新订单状态，确定是否开仓
        //  价格触达布林下轨，先平空单，并且没有多单情况下，再建多单
        var localOffsetPrice_buy = buyProfit * offsetPriceRate;
        var localOffsetPrice_sell = sellProfit * offsetPriceRate;
        if (price <= lower + localOffsetPrice_buy &&
            price >= lower &&
            orderInfo.posSide !== "long" &&
            currentTicket.Time !== orderInfo.lastOrderTime &&
            dayDecide.direction === "short&&long"
        ) {

            var status = decideWithLong(boolTickets, bool, 10);
            if (status !== "OK") {
                G.Sleep(150);
                continue;
            }
            // Price	Amount	Message
            //  平空
            G.Log("下单成功，开多单", price, sz);
            //  价格高市价100，保证可以成交
            var orderId = Okex.Trade({
                instId: instId,
                tdMode: "cross",
                side: 'buy',
                posSide: "long",
                ordType: "limit",
                px: price + 100,
                sz: sz
            })

            if (orderId) {
                var deficitPrice = middle - lower;
                orderInfo = {
                    orderId: orderId,
                    posSide: "long",
                    tpTriggerPx: middle - localOffsetPrice_buy,//  止盈
                    slTriggerPx: lower - deficitPrice,// 止损
                    lastOrderTime: currentTicket.Time
                }

                G.Log(orderInfo)
            } else {
                G.Log("下多单失败");
                G.Sleep(3000);
            }
        } else if (price >= upper - localOffsetPrice_sell &&
            price <= upper &&
            orderInfo.posSide !== "short" &&
            currentTicket.Time !== orderInfo.lastOrderTime &&
            dayDecide.direction === "short&&long"
        ) {

            var status = decideWithShort(boolTickets, bool, 10);
            if (status !== "OK") {
                G.Sleep(150);
                continue;
            }
            G.Log("下单成功，开空单", price, sz);
            //  价格低于市价100，保证做空可以成交
            var orderId = Okex.Trade({
                instId: instId,
                tdMode: "cross",
                side: 'sell',
                posSide: "short",
                ordType: "limit",
                px: price - 100,
                sz: sz
            })
            if (orderId) {
                var deficitPrice = upper - middle;
                orderInfo = {
                    orderId: orderId,
                    posSide: "short",
                    tpTriggerPx: middle + localOffsetPrice_sell,//  止盈
                    slTriggerPx: upper + deficitPrice,// 止损
                    lastOrderTime: currentTicket.Time,
                }
                G.Log(orderInfo)
            } else {
                G.Log("下空单失败");
                G.Sleep(3000);
            }
        }

        G.Sleep(400);
    }
}
