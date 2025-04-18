import React from 'react';

const RoomsSection = () => {
  return (
    <section id="rooms" className="mt-20">
      <div className="w-full px-4 mx-auto">
        <div className="flex flex-wrap">
          <div className="w-full text-center mb-5">
            <h6 className="text-lg">Industries We Serve</h6>
            <h3 className="text-2xl font-bold">Solutions by Industry</h3>
          </div>
        </div>
        <div className="flex flex-wrap mx-0">
          {/* Room Item 1 */}
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:pr-4">
            <div className="relative overflow-hidden group">
              <img 
                src="/apartment1.jpeg" 
                className="w-full transition-all duration-400 ease-in group-hover:scale-[1.05]" 
                alt="Residential Apartments"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition-all duration-400 ease-in z-10"></div>
              <div className="absolute left-[1.875rem] right-[1.875rem] top-1/2 -translate-y-1/2 z-20">
                <div className="border-2 border-white py-20 px-[1.875rem] scale-120 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-in">
                  <h5 className="text-white mb-5 underline">Residential Apartments</h5>
                  <p className="text-white">
                    Arrange recyclable Waste collection Drives after every 3 months
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Room Item 2 */}
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:px-2">
            <div className="relative overflow-hidden group">
              <img 
                src="/itcompany.jpeg" 
                className="w-full transition-all duration-400 ease-in group-hover:scale-[1.05]" 
                alt="IT Companies/Bank Offices"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition-all duration-400 ease-in z-10"></div>
              <div className="absolute left-[1.875rem] right-[1.875rem] top-1/2 -translate-y-1/2 z-20">
                <div className="border-2 border-white py-20 px-[1.875rem] scale-120 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-in">
                  <h5 className="text-white mb-5 underline">IT Companies/Bank Offices</h5>
                  <p className="text-white">
                    Old Monitors, CPUs, Printers, Telephone, Servers, UPS and Many more on regularly Basis.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Room Item 3 */}
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:pl-4">
            <div className="relative overflow-hidden group">
              <img 
                src="/contraction.jpeg" 
                className="w-full transition-all duration-400 ease-in group-hover:scale-[1.05]" 
                alt="Construction and Industries"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition-all duration-400 ease-in z-10"></div>
              <div className="absolute left-[1.875rem] right-[1.875rem] top-1/2 -translate-y-1/2 z-20">
                <div className="border-2 border-white py-20 px-[1.875rem] scale-120 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-in">
                  <h5 className="text-white mb-5 underline">Construction and Industries</h5>
                  <p className="text-white">
                    PVS Pipe scrap, All kind of metal Scrap, Waste kraft, GI Pipe cut pieces, used copper/Aluminum wires etc. on daily weekly and monthly intervals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;