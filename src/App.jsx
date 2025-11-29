import React, { useState } from 'react';
import { Calculator, Hammer, PieChart, TrendingUp, Sparkles } from 'lucide-react';

// --- UI 组件 ---

// 1. 输入框组件：
// - 风格升级：带有背景色的圆角输入框，聚焦时有边框和光晕动画
// - 交互优化：更强的点击反馈
// - 功能：禁用滚轮，限制非负数
const InputField = ({ label, value, onChange, required, suffix = "", prefix = "¥", theme = "indigo" }) => {
  
  // 根据传入的主题色定义聚焦样式
  const focusColorClasses = {
    orange: "focus-within:border-orange-400 focus-within:shadow-[0_0_0_3px_rgba(251,146,60,0.15)]",
    indigo: "focus-within:border-indigo-400 focus-within:shadow-[0_0_0_3px_rgba(129,140,248,0.15)]",
    emerald: "focus-within:border-emerald-400 focus-within:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]",
  }[theme] || "focus-within:border-slate-400";

  return (
    <div className="flex items-center justify-between py-2 px-1 mb-1">
      {/* Label 区域 */}
      <label className={`text-xs font-bold w-5/12 flex-shrink-0 flex items-center gap-1.5 transition-colors ${required ? 'text-slate-700' : 'text-slate-400'}`}>
        {label}
        {required && (
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="必填"></span>
        )}
      </label>

      {/* Input 区域 */}
      <div className="relative w-7/12">
        <div className={`
          flex items-center w-full rounded-lg px-3 py-2.5
          bg-slate-100 hover:bg-slate-50
          border border-transparent transition-all duration-200 ease-out
          ${focusColorClasses}
          group cursor-text
        `}>
          {/* 前缀 (¥) */}
          <span className="text-slate-400 text-xs font-bold mr-2 group-focus-within:text-slate-500 transition-colors select-none">
            {prefix}
          </span>
          
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || parseFloat(val) >= 0) {
                onChange(val);
              }
            }}
            onKeyDown={(e) => {
              if (["-", "+", "e", "E"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            // 禁用滚轮调节数值
            onWheel={(e) => e.target.blur()}
            placeholder={required ? "0" : "0"}
            className={`
              w-full bg-transparent text-right text-sm font-bold tracking-tight
              text-slate-800 placeholder:text-slate-300
              focus:outline-none
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            `}
          />
          
          {/* 后缀 (单位) */}
          {suffix && (
            <span className="text-slate-400 text-[10px] font-bold ml-1.5 select-none bg-slate-200/50 px-1 rounded">
              {suffix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// 2. 结果单元格：保持极简排版
const ResultBox = ({ label, value, subtext, highlightColor = "text-slate-800", isNegativeRed = false, isLast = false, border = true }) => {
  const numValue = typeof value === 'number' ? value : 0;
  
  let finalColorClass = highlightColor;
  if (isNegativeRed) {
    finalColorClass = numValue >= 0 ? 'text-emerald-600' : 'text-rose-600';
  }

  return (
    <div className={`flex flex-col px-4 py-4 flex-1 min-w-[90px] justify-center relative ${border && !isLast ? 'border-r border-slate-100' : ''}`}>
      <span className="text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider truncate">{label}</span>
      <span className={`font-mono font-black text-xl leading-none tracking-tight ${finalColorClass}`}>
        {/* 仅保留数值本身（负数自带符号），保留2位小数 */}
        {numValue.toFixed(2)}
      </span>
      {subtext && <span className="text-[9px] text-slate-400/80 mt-1.5 font-medium truncate">{subtext}</span>}
    </div>
  );
};

// 3. 模块标题
const ModuleHeader = ({ icon: Icon, title, bgColor, iconColor }) => (
  <div className="flex items-center gap-3 mb-4 pl-1">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform hover:scale-105 ${bgColor}`}>
      <Icon size={18} className={iconColor} strokeWidth={2.5} />
    </div>
    <h3 className="text-sm font-bold text-slate-800 tracking-wide">{title}</h3>
  </div>
);

const InvestmentCalculator = () => {
  // --- 状态 ---
  const [newStore, setNewStore] = useState({
    rent: '', paymentTerms: '', deposit: '', transferFee: '', franchiseFee: '',
    renovationAds: '', equipment: '', materials: '',
    monthlyLabor: '', utilities: '', grossMargin: ''
  });

  const [existingStore, setExistingStore] = useState({
    dailyRevenue: '', dailyRent: '', dailyLabor: '', dailyUtilities: '', grossMargin: ''
  });

  // --- 实时计算 ---
  const parse = (val) => parseFloat(val) || 0;

  // 1. 新开店
  const nsRent = parse(newStore.rent);
  const nsTerms = parse(newStore.paymentTerms);
  const nsSetupCost = (nsRent * nsTerms) + parse(newStore.deposit) + parse(newStore.transferFee) + 
                      parse(newStore.franchiseFee) + parse(newStore.renovationAds) + 
                      parse(newStore.equipment) + parse(newStore.materials);
  
  const nsDailyFixed = (nsRent + parse(newStore.monthlyLabor) + parse(newStore.utilities)) / 30;
  const nsMargin = parse(newStore.grossMargin) / 100;
  const nsBreakEven = nsMargin > 0 ? nsDailyFixed / nsMargin : 0;

  // 2. 已开店
  const exRevenue = parse(existingStore.dailyRevenue);
  const exMargin = parse(existingStore.grossMargin) / 100;
  const exFixedCost = parse(existingStore.dailyRent) + parse(existingStore.dailyLabor) + parse(existingStore.dailyUtilities);
  const exGrossProfit = exRevenue * exMargin;
  const exNetProfit = exGrossProfit - exFixedCost;
  const exBreakEven = exMargin > 0 ? exFixedCost / exMargin : 0;

  return (
    <div className="min-h-screen bg-[#F2F3F5] text-slate-900 font-sans p-4 lg:p-8 transition-colors duration-300">
      
      <div className="max-w-[1600px] mx-auto h-full flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-2 gap-4">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white rounded-2xl text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
               <Calculator size={26} strokeWidth={2} />
             </div>
             <div>
               <h1 className="text-2xl font-black tracking-tighter text-slate-800">
                 餐饮投资计算器
               </h1>
               <div className="flex items-center gap-2 mt-1">
                 <p className="text-xs text-slate-500 font-medium tracking-wide">财务模型 v2.0</p>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-bold text-slate-500 bg-white py-3 px-6 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.02)] border border-white/60">
             <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]"></span> 必填项</span>
             <span className="w-px h-3 bg-slate-200"></span>
             <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.4)]"></span> 自动计算</span>
          </div>
        </div>

        {/* 核心布局：三列并排 Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* === 模块 1：建店成本 === */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white flex flex-col h-full overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 group">
            {/* 顶部彩色条 */}
            <div className="h-1.5 w-full bg-orange-200 group-hover:bg-orange-300 transition-colors"></div>
            
            <div className="p-6 pb-2">
               <ModuleHeader icon={Hammer} title="新开店：建店成本" bgColor="bg-orange-50" iconColor="text-orange-500" />
            </div>
            
            <div className="px-6 pb-6 flex-1 space-y-1">
               <InputField theme="orange" label="房租 (元/月)" value={newStore.rent} onChange={v => setNewStore({...newStore, rent: v})} required />
               <InputField theme="orange" label="支付方式 (月)" value={newStore.paymentTerms} onChange={v => setNewStore({...newStore, paymentTerms: v})} suffix="" required prefix="" />
               <InputField theme="orange" label="押金" value={newStore.deposit} onChange={v => setNewStore({...newStore, deposit: v})} />
               <InputField theme="orange" label="转让费/中介" value={newStore.transferFee} onChange={v => setNewStore({...newStore, transferFee: v})} />
               <InputField theme="orange" label="加盟/学习费" value={newStore.franchiseFee} onChange={v => setNewStore({...newStore, franchiseFee: v})} />
               <InputField theme="orange" label="装修+广告" value={newStore.renovationAds} onChange={v => setNewStore({...newStore, renovationAds: v})} />
               <InputField theme="orange" label="设备费" value={newStore.equipment} onChange={v => setNewStore({...newStore, equipment: v})} />
               <InputField theme="orange" label="首批物料" value={newStore.materials} onChange={v => setNewStore({...newStore, materials: v})} />
            </div>

            {/* 底部结果 */}
            <div className="bg-slate-50 border-t border-slate-100 flex p-0">
               <ResultBox 
                  label="建店总成本" 
                  value={nsSetupCost} 
                  highlightColor="text-orange-600"
                  subtext="房租×期数 + 各项杂费"
                  isLast={true}
               />
            </div>
          </div>

          {/* === 模块 2：盈亏平衡 === */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white flex flex-col h-full overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 group">
            <div className="h-1.5 w-full bg-indigo-200 group-hover:bg-indigo-300 transition-colors"></div>

            <div className="p-6 pb-2">
               <ModuleHeader icon={PieChart} title="新开店：盈亏平衡" bgColor="bg-indigo-50" iconColor="text-indigo-500" />
            </div>

            <div className="px-6 pb-6 flex-1 space-y-1">
               <InputField theme="indigo" label="每月人工" value={newStore.monthlyLabor} onChange={v => setNewStore({...newStore, monthlyLabor: v})} required />
               <InputField theme="indigo" label="水电杂费(月)" value={newStore.utilities} onChange={v => setNewStore({...newStore, utilities: v})} required />
               <InputField theme="indigo" label="预估毛利率" value={newStore.grossMargin} onChange={v => setNewStore({...newStore, grossMargin: v})} required prefix="%" suffix="" />
               
               <div className="mt-8 p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col items-center text-center">
                  <Sparkles size={20} className="text-indigo-400 mb-2" />
                  <p className="text-xs text-slate-700 font-bold">
                    盈亏平衡指标
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 px-4 leading-relaxed">
                    此数据帮助您了解店铺每天需要达到多少营业额才能不亏损。
                  </p>
               </div>
            </div>

            {/* 底部结果 */}
            <div className="bg-slate-50 border-t border-slate-100 flex divide-x divide-slate-100">
               <ResultBox 
                  label="每日固定成本" 
                  value={nsDailyFixed} 
                  subtext="(房租+人工+杂费)/30"
                  // 颜色与右侧盈亏平衡点一致
                  highlightColor="text-indigo-600"
               />
               <ResultBox 
                  label="日盈亏平衡点" 
                  value={nsBreakEven} 
                  highlightColor="text-indigo-600"
                  subtext="固定成本 ÷ 毛利率"
                  isLast={true}
               />
            </div>
          </div>

          {/* === 模块 3：已开店分析 === */}
          <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-white flex flex-col h-full overflow-hidden relative hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 group">
            <div className="h-1.5 w-full bg-emerald-200 group-hover:bg-emerald-300 transition-colors"></div>
            
            <div className="p-6 pb-2">
               <ModuleHeader icon={TrendingUp} title="已开店经营分析" bgColor="bg-emerald-50" iconColor="text-emerald-500" />
            </div>

            <div className="px-6 pb-6 flex-1 space-y-1">
               <InputField theme="emerald" label="营业额 / 天" value={existingStore.dailyRevenue} onChange={v => setExistingStore({...existingStore, dailyRevenue: v})} required />
               <InputField theme="emerald" label="房租 / 天" value={existingStore.dailyRent} onChange={v => setExistingStore({...existingStore, dailyRent: v})} required />
               <InputField theme="emerald" label="人工 / 天" value={existingStore.dailyLabor} onChange={v => setExistingStore({...existingStore, dailyLabor: v})} required />
               <InputField theme="emerald" label="水电杂费 / 天" value={existingStore.dailyUtilities} onChange={v => setExistingStore({...existingStore, dailyUtilities: v})} required />
               <InputField theme="emerald" label="实际毛利率" value={existingStore.grossMargin} onChange={v => setExistingStore({...existingStore, grossMargin: v})} required prefix="%" suffix="" />
            </div>

            {/* 底部结果 */}
            <div className="bg-slate-50 border-t border-slate-100 mt-auto">
               <div className="flex border-b border-slate-100">
                  <ResultBox 
                    label="毛利 (天)" 
                    value={exGrossProfit} 
                    // 开启正负变色
                    isNegativeRed={true}
                  />
                  <ResultBox 
                    label="固定成本 (天)" 
                    value={exFixedCost} 
                    isLast={true}
                    // 开启正负变色
                    isNegativeRed={true}
                  />
               </div>
               <div className="flex divide-x divide-slate-100">
                  <ResultBox 
                    label="保本线 (营业额)" 
                    value={exBreakEven} 
                    // 开启正负变色
                    isNegativeRed={true}
                    subtext="固定成本 ÷ 毛利率"
                  />
                  <ResultBox 
                    label="净利润 (天)" 
                    value={exNetProfit} 
                    isNegativeRed={true}
                    subtext="毛利 - 固定成本"
                    isLast={true}
                  />
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default function App() {
  return <InvestmentCalculator />;
}
