import React, { useRef, useState } from "react"
import { BoardView } from "./board"
import { allPieces, CellKind, flipped, Piece, Problem, rotated } from "./data"

export function Editor(props: { problem: Problem, onChange: (problem: Problem) => void }) {
    const { problem, onChange } = props
    const [dragState, setDragState] = useState<{ piece: Piece, mousePos: [number, number] } | null>(null)

    const pieces = allPieces()
    const [orientation, setOrientation] = useState(new Array<number>(pieces.length).fill(0))

    const pieceRef = new Array(pieces.length).fill(0).map(() => useRef<HTMLDivElement>(null))
    const problemRef = useRef<HTMLDivElement>(null)

    const ps = orientation.map((o, pi) => {
        if ((problem.rest >> pi & 1) == 0) {
            return null
        }
        const p = pieces[pi][o]
        const b = new Array<Array<CellKind>>()
        for (let i = 0; i < p.shape.length; i++) {
            b.push([])
            for (let j = 0; j < p.shape[0].length; j++) {
                b[i].push(p.shape[i][j] ? p.kind : CellKind.Empty)
            }
        }
        return <div ref={pieceRef[pi]} key={pi} draggable={true} style={{ margin: 10, display: "inline-block" }} onDragStart={(ev) => {
            const rect = pieceRef[pi].current?.getBoundingClientRect()
            if (!rect) {
                return
            }
            setDragState({
                piece: p,
                mousePos: [ev.clientX - rect.x, ev.clientY - rect.y]
            })
        }} onClick={(_e) => {
            const newOrientation = orientation.slice()
            newOrientation[pi] = (o + 1) % pieces[pi].length
            setOrientation(newOrientation)
        }}>
            <BoardView board={b} />
        </div >
    })

    const N = 30
    return <div>
        <div className="pure-u-1-5" />
        <div className="pure-u-4-5">
            <h2>Problem editor</h2>
            <p>
                Drag to put. Right-Click to rotate. Click to flip.
            </p>
            <div ref={problemRef} id="problem" onClick={(ev) => {
                const rect = problemRef.current?.getBoundingClientRect()
                if (!rect) {
                    return
                }
                const [col, row] = [
                    Math.max(0, Math.round((ev.clientY - rect.y - N / 2) / N)),
                    Math.max(0, Math.round((ev.clientX - rect.x - N / 2) / N)),
                ]

                const newProblem = problem.clone()
                const ok = newProblem.remove(col, row)
                if (!ok) {
                    return
                }
                onChange(newProblem)
            }} onDragOver={(ev) => {
                ev.preventDefault()
                ev.dataTransfer.dropEffect = "move"
            }} onDrop={(ev) => {
                ev.preventDefault()

                const rect = problemRef.current?.getBoundingClientRect()
                if (!rect || !dragState) {
                    return
                }
                const [pixelX, pixelY] = [
                    ev.clientX - rect.x - dragState.mousePos[0],
                    ev.clientY - rect.y - dragState.mousePos[1],
                ]
                const [col, row] = [Math.max(0, Math.round(pixelY / N)), Math.max(0, Math.round(pixelX / N))]
                console.log(col, row)

                const newProblem = problem.clone()
                const [ok, _] = newProblem.put(dragState.piece, col, row, false)
                if (!ok) {
                    return
                }
                onChange(newProblem)
                setDragState(null)
            }}>
                <BoardView board={problem.field} size={N} style={{ outline: "solid", outlineColor: "slategray" }} />
            </div>
            <div>
                {ps}
            </div>
        </div >
    </div>
}
