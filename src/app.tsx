import React, { useState } from "react";
import { Solver } from "./solver";

export function App() {
    const [md, setMD] = useState(newMonthDay())

    return <div className="pure-g">
        <MonthDayInput md={md} onChange={setMD} />
        <Solver month={md.month} day={md.day} />
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
    return <>
        <div className="pure-u-1-4" />
        <div className="pure-u-1-4">
            <label>Month
                <input type="number" min={1} max={12} value={md.month} onChange={(e) => onChange({ day: md.day, month: parseInt(e.target.value) })} />
            </label>
        </div>
        <div className="pure-u-1-4">
            <label>Day
                <input type="number" min={1} max={31} value={md.day} onChange={(e) => onChange({ month: md.month, day: parseInt(e.target.value) })} />
            </label>
        </div>
        <div className="pure-u-1-4" />
    </>
}
