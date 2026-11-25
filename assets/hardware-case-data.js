/* 硬件清单与价格测算 v1 · 原表数量、单价以元计；参数状态按工作簿记录。 */
window.HardwareCase = {
  "devices": [
    {
      "id": 1,
      "category": "一、AI算力与推理平台",
      "name": "大模型推理一体机（问答+预审专用）",
      "brand": "国产/华为、浪潮、新华三",
      "spec": "整机 8×加速卡，整机显存≥512GB，内置推理引擎与模型适配服务",
      "unit": "套",
      "quantity": 2,
      "unitPrice": 980000,
      "range": "88.0万–110.0万",
      "grade": "A",
      "basis": "S1 97.7万/套、S2 80.0万/套取区间上沿，含模型适配与推理引擎",
      "use": "政务问答与材料预审主推理节点",
      "checks": [
        {
          "requirement": "整机加速卡 8 张",
          "status": "符合",
          "remark": "本方案配置 8 张，满足多模型并行与高并发推理"
        },
        {
          "requirement": "≥512GB",
          "status": "符合",
          "remark": "8×64GB=512GB，满足 70B 级模型 FP16 推理"
        },
        {
          "requirement": "≥150 QPS",
          "status": "符合",
          "remark": "按实测约 200 QPS（短文本问答），峰值留 30% 余量"
        },
        {
          "requirement": "支持国产开源模型私有化部署",
          "status": "符合",
          "remark": "含模型适配与推理引擎服务，支持昇腾/GPU 双栈"
        }
      ]
    },
    {
      "id": 2,
      "category": "一、AI算力与推理平台",
      "name": "微调训练服务器",
      "brand": "国产/浪潮、超聚变",
      "spec": "8×训练卡，卡间互联≥200GB/s，4×NVMe，内存≥1TB",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 1450000,
      "range": "120.0万–165.0万",
      "grade": "C",
      "basis": "按同类 8 卡训练整机市场区间取中值，待补 3 个成交样本",
      "use": "面向本区语料做领域微调",
      "checks": []
    },
    {
      "id": 3,
      "category": "一、AI算力与推理平台",
      "name": "推理服务器（高并发问答/OCR）",
      "brand": "国产/新华三、超聚变",
      "spec": "4×推理卡，单卡显存≥48GB，CPU≥32核",
      "unit": "台",
      "quantity": 3,
      "unitPrice": 380000,
      "range": "33.0万–45.0万",
      "grade": "A",
      "basis": "S3 48.02万/台为基准，按 4 卡规模下调约 21%",
      "use": "承接高并发问答与材料 OCR",
      "checks": [
        {
          "requirement": "≥4 张推理卡",
          "status": "符合",
          "remark": "配置 4 张，单卡显存 48GB"
        },
        {
          "requirement": "≥192GB",
          "status": "符合",
          "remark": "4×48GB=192GB"
        },
        {
          "requirement": "≥30 页/分钟/节点",
          "status": "需核验",
          "remark": "与所选 OCR 引擎相关，须实测后确认"
        }
      ]
    },
    {
      "id": 4,
      "category": "一、AI算力与推理平台",
      "name": "算力调度与推理网关",
      "brand": "国产",
      "spec": "多模型编排、灰度发布、限流熔断，支持国产化操作系统",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 260000,
      "range": "22.0万–30.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "统一纳管算力与模型版本",
      "checks": []
    },
    {
      "id": 5,
      "category": "一、AI算力与推理平台",
      "name": "边缘推理节点（分厅本地推理）",
      "brand": "国产",
      "spec": "1×推理卡，≥8 核，断网可离线推理，支持模型下发",
      "unit": "台",
      "quantity": 6,
      "unitPrice": 38000,
      "range": "3.2万–4.5万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "6 个分厅/街道便民点各 1 台",
      "checks": []
    },
    {
      "id": 6,
      "category": "二、存储与网络",
      "name": "分布式存储（可用 300TB）",
      "brand": "国产/华为、浪潮",
      "spec": "三副本，NVMe 缓存，支持横向扩展与快照",
      "unit": "套",
      "quantity": 1,
      "unitPrice": 620000,
      "range": "55.0万–72.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "存放材料原文、切片与向量库",
      "checks": [
        {
          "requirement": "≥300TB",
          "status": "符合",
          "remark": "三副本裸容量 900TB，可用 300TB"
        },
        {
          "requirement": "NVMe 缓存 + 混闪",
          "status": "符合",
          "remark": "配置 NVMe 读缓存，容量层为混闪"
        },
        {
          "requirement": "支持横向扩容不停机",
          "status": "符合",
          "remark": "节点级横向扩展"
        }
      ]
    },
    {
      "id": 7,
      "category": "二、存储与网络",
      "name": "备份一体机（100TB）",
      "brand": "国产",
      "spec": "定时+实时备份，支持异地复制",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 185000,
      "range": "16.0万–22.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "等保与容灾要求",
      "checks": []
    },
    {
      "id": 8,
      "category": "二、存储与网络",
      "name": "核心交换机",
      "brand": "国产/华为、锐捷",
      "spec": "25G/100G 混合，双电源，可堆叠",
      "unit": "台",
      "quantity": 2,
      "unitPrice": 118000,
      "range": "10.0万–14.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "双机热备",
      "checks": []
    },
    {
      "id": 9,
      "category": "二、存储与网络",
      "name": "万兆接入交换机（48 口）",
      "brand": "国产/华为、锐捷",
      "spec": "48×10G + 4×25G",
      "unit": "台",
      "quantity": 6,
      "unitPrice": 28000,
      "range": "2.4万–3.4万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "窗口与自助区接入",
      "checks": []
    },
    {
      "id": 10,
      "category": "二、存储与网络",
      "name": "光模块与综合布线",
      "brand": "—",
      "spec": "25G 光模块、机柜内六类布线、配线架",
      "unit": "批",
      "quantity": 1,
      "unitPrice": 92000,
      "range": "8.0万–11.0万",
      "grade": "C",
      "basis": "按机柜数量与点位类比估算",
      "use": "含施工辅材",
      "checks": []
    },
    {
      "id": 11,
      "category": "二、存储与网络",
      "name": "上网行为管理",
      "brand": "国产/深信服、奇安信",
      "spec": "万兆，应用识别、行为审计、带宽管理",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 78000,
      "range": "6.5万–9.5万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "上网留痕合规",
      "checks": []
    },
    {
      "id": 12,
      "category": "三、安全与合规",
      "name": "下一代防火墙",
      "brand": "国产/深信服、天融信",
      "spec": "万兆吞吐，含 IPS/AV/URL 特征库",
      "unit": "台",
      "quantity": 2,
      "unitPrice": 158000,
      "range": "13.0万–19.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "互联网区与核心区各 1",
      "checks": [
        {
          "requirement": "≥万兆",
          "status": "符合",
          "remark": "万兆吞吐，含 IPS/AV/URL 特征库"
        },
        {
          "requirement": "支持双机热备",
          "status": "符合",
          "remark": "互联网区与核心区各 1 台，主备部署"
        }
      ]
    },
    {
      "id": 13,
      "category": "三、安全与合规",
      "name": "Web 应用防火墙（WAF）",
      "brand": "国产/长亭、安恒",
      "spec": "万兆，OWASP 规则集，防爬防注入",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 148000,
      "range": "12.0万–18.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "问答与预审对外服务防护",
      "checks": []
    },
    {
      "id": 14,
      "category": "三、安全与合规",
      "name": "数据库审计",
      "brand": "国产/安恒、启明星辰",
      "spec": "支持 Oracle/MySQL/达梦/人大金仓",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 112000,
      "range": "9.0万–14.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "材料与个人信息访问留痕",
      "checks": []
    },
    {
      "id": 15,
      "category": "三、安全与合规",
      "name": "堡垒机（50 并发）",
      "brand": "国产/齐治、深信服",
      "spec": "运维审计、双因子、命令阻断",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 98000,
      "range": "8.0万–12.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "第三方运维管控",
      "checks": []
    },
    {
      "id": 16,
      "category": "三、安全与合规",
      "name": "日志审计",
      "brand": "国产",
      "spec": "≥500EPS，留存≥6 个月",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 78000,
      "range": "6.0万–10.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "等保三级要求",
      "checks": []
    },
    {
      "id": 17,
      "category": "三、安全与合规",
      "name": "漏洞扫描",
      "brand": "国产/绿盟、安恒",
      "spec": "Web/主机/基线扫描，含弱口令检测",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 88000,
      "range": "7.0万–11.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "上线前与季度巡检",
      "checks": []
    },
    {
      "id": 18,
      "category": "三、安全与合规",
      "name": "终端安全管理系统（200 点）",
      "brand": "国产/奇安信、360",
      "spec": "防病毒 + EDR，集中管控",
      "unit": "套",
      "quantity": 1,
      "unitPrice": 116000,
      "range": "9.0万–15.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "窗口终端与自助机",
      "checks": []
    },
    {
      "id": 19,
      "category": "三、安全与合规",
      "name": "服务器密码机/签名验签",
      "brand": "国产（商用密码产品认证）",
      "spec": "国密 SM2/SM3/SM4，满足密评要求",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 165000,
      "range": "14.0万–20.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "材料签署与身份凭证",
      "checks": []
    },
    {
      "id": 20,
      "category": "三、安全与合规",
      "name": "NTP 时间戳服务器",
      "brand": "国产",
      "spec": "北斗授时，精度≤1ms",
      "unit": "台",
      "quantity": 1,
      "unitPrice": 45000,
      "range": "3.5万–6.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "日志与凭证时间一致性",
      "checks": []
    },
    {
      "id": 21,
      "category": "四、材料预审采集设备",
      "name": "专用高拍仪",
      "brand": "汉王、方正、良田",
      "spec": "A3 幅面，≥2300 万像素，自动对焦，含 OCR 授权",
      "unit": "台",
      "quantity": 40,
      "unitPrice": 8600,
      "range": "0.70万–1.10万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "40 个窗口各 1 台",
      "checks": [
        {
          "requirement": "≥A3",
          "status": "符合",
          "remark": "A3 幅面，满足证照与合同整页拍摄"
        },
        {
          "requirement": "≥2000 万",
          "status": "符合",
          "remark": "配置 2300 万像素，超出要求"
        },
        {
          "requirement": "自动对焦",
          "status": "符合",
          "remark": "自动对焦，支持曲面展平"
        },
        {
          "requirement": "含 OCR 识别授权",
          "status": "符合",
          "remark": "含识别授权，支持表格与印章识别"
        }
      ]
    },
    {
      "id": 22,
      "category": "四、材料预审采集设备",
      "name": "高速扫描仪",
      "brand": "富士通、柯达、方正",
      "spec": "A4 双面 ≥80ppm，ADF≥300 页",
      "unit": "台",
      "quantity": 12,
      "unitPrice": 22000,
      "range": "1.8万–2.8万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "批量材料进件",
      "checks": [
        {
          "requirement": "≥80ppm（A4 双面）",
          "status": "符合",
          "remark": "配置 80ppm/160ipm"
        },
        {
          "requirement": "ADF ≥300 页",
          "status": "符合",
          "remark": "ADF 300 页"
        }
      ]
    },
    {
      "id": 23,
      "category": "四、材料预审采集设备",
      "name": "身份证阅读器",
      "brand": "神思、华视",
      "spec": "二代证读取，USB 免驱，含 SDK",
      "unit": "台",
      "quantity": 40,
      "unitPrice": 1800,
      "range": "0.12万–0.25万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "窗口与自助终端通用",
      "checks": [
        {
          "requirement": "二代居民身份证",
          "status": "符合",
          "remark": "支持二代证读取，含 SDK"
        },
        {
          "requirement": "USB 免驱",
          "status": "符合",
          "remark": "USB 免驱，兼容国产操作系统"
        }
      ]
    },
    {
      "id": 24,
      "category": "四、材料预审采集设备",
      "name": "护照/多证件阅读器",
      "brand": "神思、汉王",
      "spec": "支持护照 MRZ、签证、港澳台证件 OCR",
      "unit": "台",
      "quantity": 8,
      "unitPrice": 11000,
      "range": "0.90万–1.40万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "涉外与多证件事项",
      "checks": []
    },
    {
      "id": 25,
      "category": "四、材料预审采集设备",
      "name": "人脸核验终端",
      "brand": "国产/海康、大华",
      "spec": "3D 结构光活体检测，误识率≤0.001%",
      "unit": "台",
      "quantity": 22,
      "unitPrice": 13500,
      "range": "1.0万–1.6万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "身份核验与代办理拦截",
      "checks": [
        {
          "requirement": "3D 结构光防照片/视频攻击",
          "status": "符合",
          "remark": "3D 结构光活体检测"
        },
        {
          "requirement": "≤0.001%",
          "status": "需核验",
          "remark": "厂商标称值，须以第三方检测报告为准"
        }
      ]
    },
    {
      "id": 26,
      "category": "四、材料预审采集设备",
      "name": "材料自助受理终端",
      "brand": "国产定制",
      "spec": "扫描+高清摄像+触屏+凭条打印，一体化机柜",
      "unit": "台",
      "quantity": 8,
      "unitPrice": 46000,
      "range": "3.8万–5.5万",
      "grade": "C",
      "basis": "按同类政务自助受理机类比估算",
      "use": "自助提交材料并现场预审",
      "checks": []
    },
    {
      "id": 27,
      "category": "四、材料预审采集设备",
      "name": "手持核验终端",
      "brand": "国产",
      "spec": "7 英寸，身份证+人脸+条码，续航≥8h",
      "unit": "台",
      "quantity": 10,
      "unitPrice": 6800,
      "range": "0.55万–0.85万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "帮办、上门服务",
      "checks": []
    },
    {
      "id": 28,
      "category": "四、材料预审采集设备",
      "name": "证照打印机",
      "brand": "国产/得实、富士通",
      "spec": "证卡打印/覆膜，支持双面",
      "unit": "台",
      "quantity": 4,
      "unitPrice": 28000,
      "range": "2.2万–3.5万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "当场出证",
      "checks": []
    },
    {
      "id": 29,
      "category": "四、材料预审采集设备",
      "name": "预审留痕录像存储",
      "brand": "海康、大华",
      "spec": "NVR + 8TB×4，支持 30 天留存",
      "unit": "套",
      "quantity": 1,
      "unitPrice": 42000,
      "range": "3.2万–5.0万",
      "grade": "A",
      "basis": "参考摄像机成交样本 400 元/台（S4）及存储整包折算",
      "use": "预审过程可回溯",
      "checks": []
    },
    {
      "id": 30,
      "category": "五、智能问答前端",
      "name": "政务自助服务终端（问答+受理）",
      "brand": "国产定制",
      "spec": "43 英寸竖屏，内置读卡、打印、摄像、语音",
      "unit": "台",
      "quantity": 16,
      "unitPrice": 58000,
      "range": "4.8万–7.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "大厅 8 台 + 分厅 8 台",
      "checks": [
        {
          "requirement": "≥43 英寸竖屏",
          "status": "符合",
          "remark": "43 英寸竖屏，支持触控与语音"
        },
        {
          "requirement": "读卡+打印+摄像",
          "status": "符合",
          "remark": "集成身份证读卡、凭条打印、广角摄像"
        },
        {
          "requirement": "支持语音引导与大字模式",
          "status": "符合",
          "remark": "适老化界面 + 语音交互"
        }
      ]
    },
    {
      "id": 31,
      "category": "五、智能问答前端",
      "name": "触摸查询一体机 55 英寸",
      "brand": "国产",
      "spec": "红外/电容触控，i5 以上，含导览软件",
      "unit": "台",
      "quantity": 11,
      "unitPrice": 24000,
      "range": "1.8万–2.8万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "大厅与分厅导览",
      "checks": []
    },
    {
      "id": 32,
      "category": "五、智能问答前端",
      "name": "智能叫号取号一体机",
      "brand": "国产",
      "spec": "取号+叫号联动，含窗口屏",
      "unit": "台",
      "quantity": 8,
      "unitPrice": 22000,
      "range": "1.6万–2.6万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "排队与分流",
      "checks": []
    },
    {
      "id": 33,
      "category": "五、智能问答前端",
      "name": "窗口双面屏（含评价）",
      "brand": "国产",
      "spec": "内外双屏，集成满意度评价器",
      "unit": "台",
      "quantity": 40,
      "unitPrice": 5500,
      "range": "0.40万–0.70万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "40 个窗口",
      "checks": []
    },
    {
      "id": 34,
      "category": "五、智能问答前端",
      "name": "语音交互终端",
      "brand": "国产",
      "spec": "6 麦阵列，降噪≥60dB，支持方言识别",
      "unit": "台",
      "quantity": 15,
      "unitPrice": 11000,
      "range": "0.90万–1.50万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "适老化语音问答",
      "checks": []
    },
    {
      "id": 35,
      "category": "六、显示与音视频",
      "name": "大厅 LED 全彩屏 P1.8",
      "brand": "利亚德、洲明、海峡彩亮",
      "spec": "P1.8 小间距，亮度≥800nit，含控制系统与钢结构",
      "unit": "㎡",
      "quantity": 15,
      "unitPrice": 15800,
      "range": "1.40万–2.20万",
      "grade": "A",
      "basis": "S5 P2.5 成交 8,700.98 元/㎡，按点间距系数上浮约 1.8 倍",
      "use": "大厅主屏约 15 ㎡",
      "checks": [
        {
          "requirement": "P1.8 及以下",
          "status": "符合",
          "remark": "P1.8 小间距"
        },
        {
          "requirement": "≥800nit",
          "status": "符合",
          "remark": "亮度 800nit，支持亮度自适应"
        },
        {
          "requirement": "含控制系统与钢结构",
          "status": "符合",
          "remark": "含发送卡、接收卡与钢结构安装"
        }
      ]
    },
    {
      "id": 36,
      "category": "六、显示与音视频",
      "name": "拼接屏 55 英寸 3×3",
      "brand": "海康、大华",
      "spec": "3.5mm 拼缝，含矩阵与支架",
      "unit": "块",
      "quantity": 9,
      "unitPrice": 16000,
      "range": "1.3万–2.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "指挥与运营看板",
      "checks": []
    },
    {
      "id": 37,
      "category": "六、显示与音视频",
      "name": "网络音柱",
      "brand": "ITC、声欧",
      "spec": "100W，IP 网络音频，支持广播联动",
      "unit": "只",
      "quantity": 12,
      "unitPrice": 3500,
      "range": "0.28万–0.45万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "叫号与广播",
      "checks": []
    },
    {
      "id": 38,
      "category": "六、显示与音视频",
      "name": "远程帮办/视频核验终端",
      "brand": "国产",
      "spec": "4K 摄像机+会议终端，含软件授权",
      "unit": "套",
      "quantity": 2,
      "unitPrice": 55000,
      "range": "4.5万–6.5万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "远程帮办与专家坐席",
      "checks": []
    },
    {
      "id": 39,
      "category": "七、机房与配套",
      "name": "UPS 60kVA（含电池 1h）",
      "brand": "维谛、艾特网能",
      "spec": "双变换在线式，模块化，含电池组",
      "unit": "台",
      "quantity": 2,
      "unitPrice": 95000,
      "range": "8.0万–11.5万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "双机并联冗余",
      "checks": [
        {
          "requirement": "≥60kVA",
          "status": "符合",
          "remark": "60kVA 模块化，双机并联"
        },
        {
          "requirement": "≥1 小时",
          "status": "符合",
          "remark": "配置电池组，满载后备 60 分钟"
        }
      ]
    },
    {
      "id": 40,
      "category": "七、机房与配套",
      "name": "精密空调 12.5kW（列间）",
      "brand": "维谛、艾特网能",
      "spec": "风冷列间，含室外机与安装",
      "unit": "台",
      "quantity": 3,
      "unitPrice": 90000,
      "range": "7.5万–11.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "N+1 配置",
      "checks": []
    },
    {
      "id": 41,
      "category": "七、机房与配套",
      "name": "服务器机柜 42U",
      "brand": "国产",
      "spec": "42U，含 PDU、理线、前后门",
      "unit": "台",
      "quantity": 8,
      "unitPrice": 4500,
      "range": "0.38万–0.55万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "含理线与标签",
      "checks": []
    },
    {
      "id": 42,
      "category": "七、机房与配套",
      "name": "KVM 与 console",
      "brand": "国产",
      "spec": "8 口，含切换屏与线缆",
      "unit": "套",
      "quantity": 1,
      "unitPrice": 12000,
      "range": "1.00万–1.60万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "机房本地运维",
      "checks": []
    },
    {
      "id": 43,
      "category": "七、机房与配套",
      "name": "动环监控系统",
      "brand": "国产",
      "spec": "温湿度、漏水、烟感、门禁联动",
      "unit": "套",
      "quantity": 1,
      "unitPrice": 60000,
      "range": "5.0万–8.0万",
      "grade": "B",
      "basis": "市场参考价中值，待询价",
      "use": "机房无人值守",
      "checks": []
    }
  ],
  "samples": [
    {
      "id": "S1",
      "description": "大模型一体机 97.7 万元/套｜苏州城市学院｜中国政府采购网 2026-01 成交公告 http://www.ccgp.gov.cn/cggg/dfgg/cjgg/202601/t20260108_26052687.htm"
    },
    {
      "id": "S2",
      "description": "大模型一体机 80.0 万元/套｜南开大学｜中国政府采购网 2026-09 成交公告 http://www.ccgp.gov.cn/cggg/zygg/cjgg/202609/t20260911_27313023.htm"
    },
    {
      "id": "S3",
      "description": "GPU 服务器 48.02 万元/台｜南方科技大学｜采购成交公告（8 卡级训练服务器）"
    },
    {
      "id": "S4",
      "description": "室外网络摄像机 400 元/台；摄像机支架 25 元/个｜黑龙江视频监控改扩建采购合同"
    },
    {
      "id": "S5",
      "description": "P2.5 全彩 LED 8,700.98 元/㎡｜龙岩一中 LED 采购合同｜福建政府采购网"
    },
    {
      "id": "S6",
      "description": "8 卡 AI 训练推理服务器整包 542.0 万元｜智能芯片平台项目｜中国政府采购网 2024-11 中标公告"
    }
  ]
};
