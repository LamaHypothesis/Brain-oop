# Brain OOP Visualizer

> **과제 2**: 설계부터 배포까지 소프트웨어 풀사이클 경험  
> OOP 상속 구조와 다형성(Polymorphism)을 웹 환경에서 시각화

## 🧠 Class Hierarchy

```
BrainADT (Abstract Base Class)
│   ├── name: str          @abstractproperty
│   ├── struct: list       @abstractproperty
│   ├── status()           «abstract»
│   └── got_hurt(index)    «abstract»
│
└── Brain (Base Class)     ← concrete implementation
        ├── status()       «concrete» (overridable)
        └── got_hurt()     «concrete» (inherited by all)
                │
                ├── Cerebrum (대뇌)       — overrides: COGNITIVE-ACTIVE / NEURO-DEFICIT
                ├── Diencephalon (사이뇌) — overrides: HOMEO-BALANCED / SENSORY-BLOCK
                ├── Brainstem (뇌간)      — overrides: VITAL-CORE / CRITICAL-LIFE
                └── Cerebellum (소뇌)     — overrides: MOTOR-STABLE / ATAXIC-FAILED
```

## ✨ Features

- **UML Inheritance Diagram** — BrainADT → Brain → 4 subclasses
- **Polymorphic status()** — each node calls its *own* overridden `status()` when clicked
- **got_hurt(index)** — inherited method applies damage to specific brain regions
- **Live Console** — real-time log of every method call and output
- **Region Health Indicators** — visual dot per region turns red on damage

## 🛠 Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
