import { allPieces, CellKind, deepClone, Matrix, Piece, Problem, W } from "./data"

const pieces = allPieces()

self.onmessage = (message: { data: Problem }) => {
    const problem = deepClone(message.data)
    const res = new Array<Matrix<CellKind>>()
    dfs(problem, pieces, 0, 0, res)
    self.postMessage(res)
}

function dfs(prob: Problem, pieces: Array<Array<Piece>>, x: number, y: number, res: Array<Matrix<CellKind>>) {
    if (prob.rest === 0) {
        res.push(prob.field())
        return
    }

    while (prob.has(x, y)) {
        y++
        if (y >= W) {
            x++
            y = 0
        }
    }

    for (let k = 0; k < pieces.length; k++) {
        if ((prob.rest >> k & 1) === 0) {
            continue
        }
        for (let j = 0; j < pieces[k].length; j++) {
            const [ok, undo] = prob.put(pieces[k][j], x, y, true)
            if (!ok) {
                continue
            }

            dfs(prob, pieces, x, y, res)

            undo()
        }
    }
}
