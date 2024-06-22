import React from "react"

function History() {
    return (
        <div className="w-56 px-3 py-5 flex h-screen shadow-2xl">
            <div className="shadow-xl mt-auto items-center h-fit w-full mx-auto px-4 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 flex gap-3">
                <img
                    className="w-6 h-6 rounded-full"
                    src="https://api.dicebear.com/9.x/fun-emoji/svg"
                    alt=""
                />
                <span>User profile</span>
            </div>
        </div>
    )
}

export default History
