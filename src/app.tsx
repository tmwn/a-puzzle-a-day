import React, { useState } from "react";
import { Problem } from "./data";
import { Main } from "./solver";

export function App() {
    const [problem, setProblem] = useState(() => {
        const md = newMonthDay()
        return new Problem(md.month, md.day)
    })

    return <div>
        <MonthDayInput md={{ month: problem.month, day: problem.day }} onChange={(md) => {
            setProblem(new Problem(md.month, md.day))
        }} />
        <Main problem={problem} onChange={setProblem} />
    </div >
}

interface MonthDay {
    month: number
    day: number
}

const newMonthDay = () => {
    const d = new Date()
    return {
        month: d.getMonth() + 1,
        day: d.getDate(),
    }
}

function MonthDayInput(props: { md: MonthDay, onChange: (md: MonthDay) => void }) {
    const { md, onChange } = props
    return <form className="pure-form pure-g">
        <div className="pure-u-1-4" />
        <div className="pure-u-1-4">
            <label>Month</label>
            <input className="pure-input-1" type="number" min={-1} max={13} value={md.month} onChange={(e) => {
                let v = parseInt(e.target.value)
                if (!v) {
                    return
                }
                if (v < 1) v = 12
                if (v > 12) v = 1
                onChange({ day: md.day, month: v })
            }} />
        </div>
        <div className="pure-u-1-4">
            <label>Day</label>
            <input className="pure-input-1" type="number" min={-1} max={32} value={md.day} onChange={(e) => {
                let [d, m] = [parseInt(e.target.value), md.month]
                if (!d) {
                    return
                }
                if (d < 1) { d = 31; m -= 1 }
                if (d > 31) { d = 1; m += 1; if (m > 12) m = 1 }
                onChange({ month: m, day: d })
            }} />
        </div>
        <div className="pure-u-1-4" />
    </form>
}
