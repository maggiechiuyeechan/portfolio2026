const imgProperty1Default = "/anthropicxmaggie/slides/task-type-fields/445-128893-property1default.svg";
const imgProperty13T = "/anthropicxmaggie/slides/task-type-fields/445-128893-property13t.svg";
const imgCardIcons = "/anthropicxmaggie/slides/task-type-fields/445-128893-card-icons.svg";

type CardIconsProps = {
  className?: string;
  property1?: "Default" | "3t";
};

function CardIcons({ className, property1 = "Default" }: CardIconsProps) {
  const is3T = property1 === "3t";
  return (
    <div className={className || "axm-fields-layer-5"} id={is3T ? "node-497_8648" : "node-497_8650"}>
      <img alt="" className="axm-fields-layer-6" src={is3T ? imgProperty13T : imgProperty1Default} />
    </div>
  );
}

function Frame2087329156({ className }: { className?: string }) {
  return (
    <div className={className || "axm-fields-layer-7"} data-node-id="494:8521">
      <div className="axm-fields-layer-8" data-node-id="494:8359">
        <div className="axm-fields-layer-9" data-node-id="491:8345">
          <CardIcons className="axm-fields-layer-10" />
          <p className="axm-fields-layer-11" data-node-id="491:8338" style={{ fontVariationSettings: '"wdth" 100' }}>
            IT
          </p>
        </div>
      </div>
      <div className="axm-fields-layer-12" data-node-id="494:8461">
        <div className="axm-fields-layer-13" data-node-id="494:8520" data-name="Component 1">
          <p className="axm-fields-layer-14" data-node-id="I494:8520;494:8400" style={{ fontVariationSettings: '"wdth" 100' }}>{`Inventory & asset management`}</p>
          <div className="axm-fields-layer-15" data-node-id="I494:8520;494:8423">
            <div className="axm-fields-layer-16" data-node-id="I494:8520;494:8407">
              <p className="axm-fields-layer-17" data-node-id="I494:8520;494:8407;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                Device
              </p>
              <p className="axm-fields-layer-18" data-node-id="I494:8520;494:8407;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                MacBook Pro
              </p>
            </div>
            <div className="axm-fields-layer-16" data-node-id="I494:8520;494:8416">
              <p className="axm-fields-layer-19" data-node-id="I494:8520;494:8416;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                Asset tag
              </p>
              <p className="axm-fields-layer-20" data-node-id="I494:8520;494:8416;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                IT-0142
              </p>
            </div>
          </div>
        </div>
        <div className="axm-fields-layer-13" data-node-id="494:8452" data-name="Component 2">
          <p className="axm-fields-layer-14" data-node-id="I494:8452;494:8400" style={{ fontVariationSettings: '"wdth" 100' }}>{`Access & identity management`}</p>
          <div className="axm-fields-layer-15" data-node-id="I494:8452;494:8423">
            <div className="axm-fields-layer-16" data-node-id="I494:8452;494:8407">
              <p className="axm-fields-layer-21" data-node-id="I494:8452;494:8407;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                Request
              </p>
              <p className="axm-fields-layer-22" data-node-id="I494:8452;494:8407;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                Admin access
              </p>
            </div>
            <div className="axm-fields-layer-16" data-node-id="I494:8452;494:8416">
              <p className="axm-fields-layer-23" data-node-id="I494:8452;494:8416;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                Approval
              </p>
              <p className="axm-fields-layer-24" data-node-id="I494:8452;494:8416;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                Pending
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SolutionsVision() {
  return (
    <div className="axm-fields-layer-1" data-node-id="445:128893" data-name="01 About Maggie">
      <div className="axm-fields-layer-25" data-node-id="445:128894">
        <p className="axm-fields-layer-26">
          <span className="axm-fields-layer-27">Fields</span>
          <span className="axm-fields-layer-4">{` is a core part of ClickUp’s “Solutions” vision:`}</span>
        </p>
        <p className="axm-fields-layer-28">One system of record across the company for every team.</p>
      </div>
      <div className="axm-fields-layer-29" data-node-id="494:8445">
        <div className="axm-fields-layer-30" data-node-id="494:8519">
          <Frame2087329156 className="axm-fields-layer-31" />
          <div className="axm-fields-layer-31" data-node-id="494:8562">
            <div className="axm-fields-layer-8" data-node-id="I494:8562;494:8359">
              <div className="axm-fields-layer-9" data-node-id="I494:8562;491:8345">
                <div className="axm-fields-layer-10" data-node-id="I494:8562;497:8656" data-name="card icons">
                  <img alt="" className="axm-fields-layer-6" src={imgCardIcons} />
                </div>
                <p className="axm-fields-layer-11" data-node-id="I494:8562;491:8338" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Sales
                </p>
              </div>
            </div>
            <div className="axm-fields-layer-12" data-node-id="I494:8562;494:8461">
              <div className="axm-fields-layer-32" data-node-id="I494:8562;494:8520" data-name="Component 1">
                <p className="axm-fields-layer-14" data-node-id="I494:8562;494:8520;494:8400" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Enterprise CRM
                </p>
                <div className="axm-fields-layer-15" data-node-id="I494:8562;494:8520;494:8423">
                  <div className="axm-fields-layer-16" data-node-id="I494:8562;494:8520;494:8407">
                    <p className="axm-fields-layer-21" data-node-id="I494:8562;494:8520;494:8407;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Account
                    </p>
                    <p className="axm-fields-layer-33" data-node-id="I494:8562;494:8520;494:8407;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Northstar
                    </p>
                  </div>
                  <div className="axm-fields-layer-16" data-node-id="I494:8562;494:8520;494:8416">
                    <p className="axm-fields-layer-34" data-node-id="I494:8562;494:8520;494:8416;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Deal stage
                    </p>
                    <p className="axm-fields-layer-35" data-node-id="I494:8562;494:8520;494:8416;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Proposal
                    </p>
                  </div>
                </div>
              </div>
              <div className="axm-fields-layer-32" data-node-id="I494:8562;494:8452" data-name="Component 2">
                <p className="axm-fields-layer-14" data-node-id="I494:8562;494:8452;494:8400" style={{ fontVariationSettings: '"wdth" 100' }}>{`Expansion & cross-sell`}</p>
                <div className="axm-fields-layer-15" data-node-id="I494:8562;494:8452;494:8423">
                  <div className="axm-fields-layer-16" data-node-id="I494:8562;494:8452;494:8407">
                    <p className="axm-fields-layer-36" data-node-id="I494:8562;494:8452;494:8407;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Opportunity
                    </p>
                    <p className="axm-fields-layer-37" data-node-id="I494:8562;494:8452;494:8407;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Add 25 seats
                    </p>
                  </div>
                  <div className="axm-fields-layer-16" data-node-id="I494:8562;494:8452;494:8416">
                    <p className="axm-fields-layer-38" data-node-id="I494:8562;494:8452;494:8416;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Stage
                    </p>
                    <p className="axm-fields-layer-39" data-node-id="I494:8562;494:8452;494:8416;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Discovery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="axm-fields-layer-31" data-node-id="494:8492">
            <div className="axm-fields-layer-8" data-node-id="497:8672">
              <div className="axm-fields-layer-9" data-node-id="497:8673">
                <CardIcons className="axm-fields-layer-10" property1="3t" />
                <p className="axm-fields-layer-11" data-node-id="497:8675" style={{ fontVariationSettings: '"wdth" 100' }}>
                  HR
                </p>
              </div>
            </div>
            <div className="axm-fields-layer-12" data-node-id="494:8500">
              <div className="axm-fields-layer-40" data-node-id="494:8501" data-name="Component 1">
                <p className="axm-fields-layer-14" data-node-id="I494:8501;494:8400" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Employee onboarding
                </p>
                <div className="axm-fields-layer-15" data-node-id="I494:8501;494:8423">
                  <div className="axm-fields-layer-16" data-node-id="I494:8501;494:8407">
                    <p className="axm-fields-layer-41" data-node-id="I494:8501;494:8407;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                      New hire
                    </p>
                    <p className="axm-fields-layer-42" data-node-id="I494:8501;494:8407;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Avery Lee
                    </p>
                  </div>
                  <div className="axm-fields-layer-16" data-node-id="I494:8501;494:8416">
                    <p className="axm-fields-layer-43" data-node-id="I494:8501;494:8416;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Start date
                    </p>
                    <p className="axm-fields-layer-44" data-node-id="I494:8501;494:8416;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Jan 12
                    </p>
                  </div>
                </div>
              </div>
              <div className="axm-fields-layer-40" data-node-id="494:8502" data-name="Component 2">
                <p className="axm-fields-layer-14" data-node-id="I494:8502;494:8400" style={{ fontVariationSettings: '"wdth" 100' }}>{`Recruiting & hiring`}</p>
                <div className="axm-fields-layer-15" data-node-id="I494:8502;494:8423">
                  <div className="axm-fields-layer-16" data-node-id="I494:8502;494:8407">
                    <p className="axm-fields-layer-45" data-node-id="I494:8502;494:8407;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Role
                    </p>
                    <p className="axm-fields-layer-46" data-node-id="I494:8502;494:8407;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Sr. Designer
                    </p>
                  </div>
                  <div className="axm-fields-layer-16" data-node-id="I494:8502;494:8416">
                    <p className="axm-fields-layer-38" data-node-id="I494:8502;494:8416;494:8401" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Stage
                    </p>
                    <p className="axm-fields-layer-47" data-node-id="I494:8502;494:8416;494:8402" style={{ fontVariationSettings: '"wdth" 100' }}>
                      HM Screening
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
