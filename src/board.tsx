import React, { useEffect, useRef } from "react"
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

export function BoardView(props: { board: Matrix<CellKind>, cellSize?: number, style?: CSSProperties }) {
    const { board, cellSize: size, style } = props

    const N = size || 20
    const [h, w] = [board.length, board[0].length]

    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (!canvasRef.current) return
        const ctx = canvasRef.current!.getContext('2d')!
        ctx.clearRect(0, 0, N * w, N * h)
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                const c = color(board[i][j])
                ctx.fillStyle = c
                ctx.fillRect(j * N, i * N, N, N)
            }
        }
    })

    return <canvas ref={canvasRef} height={N * h} width={N * w} style={style} />
}
