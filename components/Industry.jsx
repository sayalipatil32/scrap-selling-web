"use client";
import React from 'react';

const RoomsSection = () => {
    return (
        <section id="rooms" className="rooms_wrapper  !px-10"  style={{ marginTop: '80px' }} >
            <div className="w-full px-4 mx-auto">
                <div className="flex flex-wrap">
                    <div className="w-full text-center mb-5">
                        <h6>Industries We Serve</h6>
                        <h3>Solutions by Industry</h3>
                    </div>
                </div>
                <div className="flex flex-wrap mx-0 ">
                    {/* Room Item 1 */}
                    <div className="w-full md:w-1/3 mb-4 md:mb-0 p-0">
                        <div className="room-items">
                            <img
                                src="/apartment1.jpeg"
                                className="room-items-img w-full"
                                alt="Residential Apartments"
                            />
                            <div className="room-item-wrap">
                                <div className="room-content">
                                    <h5 className="text-white mb-5 underline">Residential Apartments</h5>
                                    <p className="text-white">
                                        Arrange recyclable Waste collection Drives after every 3 months
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Room Item 2 */}
                    <div className="w-full md:w-1/3 mb-4 md:mb-0 p-0">
                        <div className="room-items">
                            <img
                                src="/itcompany.jpeg"
                                className="room-items-img w-full"
                                alt="IT Companies/Bank Offices"
                            />
                            <div className="room-item-wrap">
                                <div className="room-content">
                                    <h5 className="text-white mb-5 underline">IT Companies/Bank Offices</h5>
                                    <p className="text-white">
                                        Old Monitors, CPUs, Printers, Telephone, Servers, UPS and Many more on regularly Basis.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Room Item 3 */}
                    <div className="w-full md:w-1/3 mb-4 md:mb-0 p-0">
                        <div className="room-items">
                            <img
                                src="/contraction.jpeg"
                                className="room-items-img w-full"
                                alt="Construction and Industries"
                            />
                            <div className="room-item-wrap">
                                <div className="room-content">
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

            <style jsx>{`
        .rooms_wrapper .room-items {
          position: relative;
          overflow: hidden;
        }

        .rooms_wrapper .room-items-img {
          width: 100%;
          -webkit-transition: all 400ms ease-in 0s;
          transition: all 400ms ease-in 0s;
        }

        .rooms_wrapper .room-items:hover .room-items-img {
          -webkit-transform: scale3d(1.05, 1.05, 1.05);
          transform: scale3d(1.05, 1.05, 1.05);
        }

        .rooms_wrapper .room-items::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: var(--bg-black, #000);
          opacity: 0;
          z-index: 1;
          -webkit-transition: all 400ms ease-in 0s;
          transition: all 400ms ease-in 0s;
        }

        .rooms_wrapper .room-items:hover::before {
          opacity: 0.6;
        }

        .rooms_wrapper .room-item-wrap {
          position: absolute;
          left: 1.875rem;
          right: 1.875rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
        }

        .rooms_wrapper .room-content {
          border: 0.125rem solid var(--bg-white, #fff);
          padding: 5rem 1.875rem;
          transform: scale3d(1.2, 1.2, 1.2);
          -webkit-transform: scale3d(1.2, 1.2, 1.2);
          transition: all 500ms ease-in 0s;
          opacity: 0;
        }

        .rooms_wrapper .room-items:hover .room-content {
          opacity: 1;
          -webkit-transform: scale3d(1, 1, 1);
          transform: scale3d(1, 1, 1);
        }

        .rooms_wrapper .text-white {
          color: #fff;
        }
      `}</style>
        </section>
    );
};

export default RoomsSection;