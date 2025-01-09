import { DynamicFormatAmount } from "@/lib/algebra/utils/common/formatAmount";
import { MemePairContract } from "@/services/contract/memepair-contract";

export const pot2PumpPumpingTGShareContent = (pair: MemePairContract) => `
🚀 Pot2Pump
💥 Ticker: ${pair.launchedToken?.symbol} 
🔹 Full Name: ${pair.launchedToken?.displayName}  

📈 Price Growth since Launch: ${pair.priceChangeDisplay}     
💵 USD Price: $${DynamicFormatAmount(pair.launchedToken?.derivedUSD ?? "0", 5)} 
📊 Total Supply: ${DynamicFormatAmount(
  pair.launchedToken?.totalSupplyWithoutDecimals
    .div(10 ** (pair.launchedToken?.decimals ?? 18))
    .toFixed(2) ?? "0",
  2
)}  
🔄 Transactions: 🟢 ${pair.launchedTokenBuyCount} / 🔴 ${pair.launchedTokenSellCount}

🔗 ${window.location.origin}/launch-detail/${pair.address}
`;

export const pot2PumpPottingTGShareContent = (pair: MemePairContract) => `
🚀 Pot2Pump
💥 Ticker: ${pair.launchedToken?.symbol} 
🔹 Full Name: ${pair.launchedToken?.displayName} 

📈 Potting Percentage: ${pair.pottingPercentageDisplay}    
💵 Total Raised: $${pair.depositedRaisedToken}    
👥 Participants count: ${pair.participantsCount}  
📊 Total Supply: ${pair.launchedToken?.totalSupplyWithoutDecimals.div(10 ** (pair.launchedToken?.decimals ?? 18)).toFixed(2)} 

🔗 ${window.location.origin}/launch-detail/${pair.address}
`;

export const pot2PumpTGShareContent = (pair: MemePairContract) => {
  return encodeURIComponent(
    pair.state === 0
      ? pot2PumpPumpingTGShareContent(pair)
      : pot2PumpPottingTGShareContent(pair)
  );
};
