import React from "react"
import { CSSProperties } from "react"
import { CellKind, Matrix, H, W } from "./data"


function color(x: CellKind) {
    switch (x) {
        case CellKind.Empty:
            return "transparent"
        case CellKind.PieceO:
            return "Orange"
        case CellKind.PieceL:
            return "Lavender"
        case CellKind.PieceN:
            return "Navajowhite"
        case CellKind.PieceP:
            return "Pink"
        case CellKind.PieceU:
            return "aqUa"
        case CellKind.PieceV:
            return "Violet"
        case CellKind.PieceY:
            return "Yellowgreen"
        case CellKind.PieceZ:
            return "Salmon"
        case CellKind.Block:
            return "slategray"
    }
}

export function BoardView(props: { board: Matrix<CellKind>, size?: number, style?: CSSProperties }) {
    const { board, size, style } = props

    const N = size || 30
    const res = []
    for (let i = 0; i < board.length; i++) {
        const row = []
        for (let j = 0; j < board[0].length; j++) {
            const c = color(board[i][j])
            row.push(<span key={j} style={{ width: N, height: N, backgroundColor: c, display: "inline-block" }} />)
        }
        res.push(<div key={i} style={{ height: N }}>
            {row}
        </div>)
    }
    return <div style={Object.assign({ width: N * board[0].length }, style)}>
        {res}
    </div>
}
