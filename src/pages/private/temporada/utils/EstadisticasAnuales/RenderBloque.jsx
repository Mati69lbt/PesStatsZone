import { TablaHistorica } from "./TablaAnual";

export const RenderBloque = ({
  titulo,
  icono,
  tabs,
  open,
  setOpen,
  openTab,
  setOpenTab,
  fromColor,
  toColor,
  borderColor,
}) => (
  <div className="mt-2">
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      className="w-full flex items-center justify-center py-2 focus:outline-none group"
    >
      <h2 className="text-l md:text-xl font-extrabold text-center m-2 text-slate-800 tracking-tight">
        <span
          className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${fromColor} via-amber-50 ${toColor} px-4 py-2 shadow-sm border ${borderColor}`}
        >
          <span>{icono}</span>
          <span>{titulo}</span>
          <span>{icono}</span>
        </span>
      </h2>
    </button>

    <div
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        open
          ? "max-h-[5000px] opacity-100 mt-2 mb-2"
          : "max-h-0 opacity-0 pointer-events-none"
      }`}
    >
      {/* DESKTOP */}
      <div className="hidden lg:flex flex-row items-start gap-2 w-full">
        {tabs.map((t) => (
          <div key={t.key} className="flex-1 min-w-0">
            <TablaHistorica
              title={t.label}
              list={t.list}
              isOpen={openTab === t.key}
              onToggle={() => setOpenTab(openTab === t.key ? null : t.key)}
            />
          </div>
        ))}
      </div>

      {/* MOBILE */}
      <div className="lg:hidden flex flex-col gap-1 w-full">
        {tabs.map((t) => (
          <TablaHistorica
            key={t.key}
            title={t.label}
            list={t.list}
            isOpen={openTab === t.key}
            onToggle={() => setOpenTab(openTab === t.key ? null : t.key)}
          />
        ))}
      </div>
    </div>
  </div>
);
