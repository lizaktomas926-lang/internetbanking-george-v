          {/* 1. Karta: Účet (kliknutím prejde na detail účtu a históriu) */}
          <div 
            onClick={() => navigate({ to: "/platby" })}
            className="cursor-pointer relative overflow-hidden rounded-2xl bg-white dark:bg-[#161a23] p-5 shadow-sm border border-slate-100 dark:border-zinc-800/40 before:absolute before:inset-x-0 before:top-0 before:h-[3.5px] before:bg-gradient-to-r before:from-[#d946ef] before:to-[#f43f5e] active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[17px] font-semibold text-slate-900 dark:text-white">Účet</h2>
                
                <div className="mt-1 flex items-baseline text-[#e11d48] dark:text-[#ff5a70]">
                  <span className="text-[32px] font-bold leading-none tracking-tight">
                    {balanceMain},
                  </span>
                  <span className="text-[18px] font-bold leading-none ml-0.5">
                    {balanceCents}&nbsp;€
                  </span>
                </div>

                <p className="mt-1.5 text-[13px] text-slate-500 dark:text-zinc-400">
                  {ownResources}
                </p>
              </div>

              <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-zinc-700/60 shrink-0 bg-slate-100 dark:bg-zinc-800">
                <img
                  src="https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=120&auto=format&fit=crop&q=80"
                  alt="Účet"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
              <Link
                to="/nova-platba"
                className="inline-flex items-center justify-center rounded-full bg-[#eef4ff] hover:bg-[#e0ecff] dark:bg-[#1b273d] dark:hover:bg-[#233454] px-4 py-2 text-[14px] font-medium text-[#196ee6] dark:text-[#60a5fa] transition"
              >
                Nová platba
              </Link>
              <button
                type="button"
                onClick={() => navigate({ to: "/platby" })}
                className="p-1 text-[#196ee6] dark:text-[#3b82f6] hover:opacity-80 transition"
                aria-label="Viac možností"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
