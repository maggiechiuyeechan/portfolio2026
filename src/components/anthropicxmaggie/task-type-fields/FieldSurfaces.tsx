const imgSelectedOnStateEnabled = "/anthropicxmaggie/slides/task-type-fields/519-37982-selected-on-state-enabled.svg";
const imgArrowLeft = "/anthropicxmaggie/slides/task-type-fields/519-37982-arrow-left.svg";
const imgCheckbox = "/anthropicxmaggie/slides/task-type-fields/519-37982-checkbox.svg";
const imgVector1 = "/anthropicxmaggie/slides/task-type-fields/519-37982-vector1.svg";
const imgVector2 = "/anthropicxmaggie/slides/task-type-fields/519-37982-vector2.svg";
const imgFrame2147234900 = "/anthropicxmaggie/slides/task-type-fields/519-37982-frame2147234900.svg";
const imgAddSmall = "/anthropicxmaggie/slides/task-type-fields/519-37982-add-small.svg";
const imgVector405 = "/anthropicxmaggie/slides/task-type-fields/519-37982-vector405.svg";
const imgSidebarList = "/anthropicxmaggie/slides/task-type-fields/519-37982-sidebar-list.svg";
const imgIconWrapper = "/anthropicxmaggie/slides/task-type-fields/519-37982-icon-wrapper.svg";
const imgAddSmall1 = "/anthropicxmaggie/slides/task-type-fields/519-37982-add-small1.svg";

type RadioProps = {
  className?: string;
  selected?: boolean;
  state?: "enabled";
};

function Radio({ className, selected = false, state = "enabled" }: RadioProps) {
  const isSelected = selected;
  return (
    <div className={className || `axm-fields-layer-132 axm-fields-layer-133 ${isSelected ? "" : "axm-fields-layer-134"}`} id={isSelected ? "node-519_33354" : "node-519_33351"}>
      {isSelected && <img alt="" className="axm-fields-layer-6" src={imgSelectedOnStateEnabled} />}
    </div>
  );
}

function Tag({ className }: { className?: string }) {
  return (
    <div className={className || "axm-fields-layer-135"} data-node-id="519:33919" data-name="tag">
      <p className="axm-fields-layer-136" data-node-id="519:33920">
        New
      </p>
    </div>
  );
}

type CheckboxProps = {
  className?: string;
  selected?: boolean;
  shape?: "square";
  state?: "enabled";
};

function Checkbox({ className, selected = false, shape = "square", state = "enabled" }: CheckboxProps) {
  return (
    <div className={className || "axm-fields-layer-137"} data-node-id="454:150165">
      <div className="axm-fields-layer-138" data-node-id="454:150166" data-name="box" />
    </div>
  );
}

export default function FieldSurfaces() {
  return (
    <div className="axm-fields-layer-1" data-node-id="519:37982" data-name="01 About Maggie">
      <p className="axm-fields-layer-139" data-node-id="519:37983">
        Accommodating for Fields on Task types, Lists, People Objects
      </p>
      <div className="axm-fields-layer-140" data-node-id="521:9139" />
      <div className="axm-fields-layer-141" data-node-id="519:34043" data-name="Select CF Type">
        <div className="axm-fields-layer-142" data-node-id="519:34044">
          <div className="axm-fields-layer-143" data-node-id="519:34045">
            <div className="axm-fields-layer-144" data-node-id="519:34046" data-name="button">
              <div className="axm-fields-layer-145" data-node-id="I519:34046;404:26620" data-name="arrowLeft">
                <img alt="" className="axm-fields-layer-6" src={imgArrowLeft} />
              </div>
            </div>
            <div className="axm-fields-layer-146" data-node-id="519:34047" data-name="button">
              <p className="axm-fields-layer-147" data-node-id="519:34048" style={{ fontVariationSettings: '"wdth" 100' }}>
                Available on
              </p>
            </div>
          </div>
        </div>
        <div className="axm-fields-layer-148" data-node-id="519:34051">
          <div className="axm-fields-layer-149" data-node-id="519:34052" data-name="divider">
            <div className="axm-fields-layer-150" data-node-id="I519:34052;1:3399" data-name="separator" />
          </div>
          <div className="axm-fields-layer-151" data-node-id="519:34053">
            <div className="axm-fields-layer-152" data-node-id="519:34054" data-name="checkbox item">
              <div className="axm-fields-layer-153" data-node-id="I519:34054;655:749" data-name="padding">
                <div className="axm-fields-layer-154" data-node-id="I519:34054;655:750" data-name="checkbox">
                  <div className="axm-fields-layer-155" data-node-id="I519:34054;655:750;492:288" data-name="box" />
                  <img alt="" className="axm-fields-layer-6" src={imgCheckbox} />
                </div>
              </div>
              <p className="axm-fields-layer-156" data-node-id="I519:34054;102:952" style={{ fontVariationSettings: '"wdth" 100' }}>
                Task Fields
              </p>
            </div>
            <div className="axm-fields-layer-157" data-node-id="519:34056">
              <div className="axm-fields-layer-158" data-node-id="519:34057">
                <div className="axm-fields-layer-159" data-node-id="519:34058">
                  <div className="axm-fields-layer-160" data-node-id="519:34059">
                    <div className="axm-fields-layer-161" data-node-id="519:34060" data-name="radio item">
                      <Radio className="axm-fields-layer-162" />
                      <p className="axm-fields-layer-163" data-node-id="I519:34060;3:2192" style={{ fontVariationSettings: '"wdth" 100' }}>
                        All tasks in
                      </p>
                    </div>
                    <div className="axm-fields-layer-164" data-node-id="519:34061" data-name="button">
                      <p className="axm-fields-layer-165" data-node-id="I519:34061;404:26634" style={{ fontVariationSettings: '"wdth" 100' }}>
                        this list
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="axm-fields-layer-159" data-node-id="519:34062">
                <div className="axm-fields-layer-166" data-node-id="519:34063">
                  <div className="axm-fields-layer-160" data-node-id="519:34064">
                    <div className="axm-fields-layer-167" data-node-id="519:34065" data-name="radio item">
                      <Radio className="axm-fields-layer-168" selected />
                      <p className="axm-fields-layer-169" data-node-id="I519:34065;3:2214" style={{ fontVariationSettings: '"wdth" 100' }}>
                        Specific types of tasks
                      </p>
                    </div>
                  </div>
                </div>
                <div className="axm-fields-layer-170" data-node-id="519:34067">
                  <div className="axm-fields-layer-171" data-node-id="519:34068">
                    <div className="axm-fields-layer-172" data-node-id="519:34069">
                      <div className="axm-fields-layer-173">
                        <img alt="" className="axm-fields-layer-52" src={imgVector1} />
                      </div>
                    </div>
                  </div>
                  <div className="axm-fields-layer-143" data-node-id="519:34070">
                    <div className="axm-fields-layer-174" data-node-id="519:34071" data-name="button">
                      <p className="axm-fields-layer-175" data-node-id="I519:34071;404:26605" style={{ fontVariationSettings: '"wdth" 100' }}>
                        Bugs
                      </p>
                    </div>
                    <p className="axm-fields-layer-163" data-node-id="519:34072" style={{ fontVariationSettings: '"wdth" 100' }}>
                      in
                    </p>
                    <div className="axm-fields-layer-164" data-node-id="519:34074" data-name="button">
                      <p className="axm-fields-layer-176" data-node-id="I519:34074;404:26605" style={{ fontVariationSettings: '"wdth" 100' }}>
                        this list
                      </p>
                    </div>
                  </div>
                </div>
                <div className="axm-fields-layer-170" data-node-id="519:34075">
                  <div className="axm-fields-layer-171" data-node-id="519:34076">
                    <div className="axm-fields-layer-177" data-node-id="519:34077">
                      <div className="axm-fields-layer-173">
                        <img alt="" className="axm-fields-layer-52" src={imgVector2} />
                      </div>
                    </div>
                  </div>
                  <div className="axm-fields-layer-178" data-node-id="519:34078">
                    <div className="axm-fields-layer-174" data-node-id="519:34079" data-name="button">
                      <p className="axm-fields-layer-175" data-node-id="I519:34079;404:26605" style={{ fontVariationSettings: '"wdth" 100' }}>
                        Form responses
                      </p>
                    </div>
                    <p className="axm-fields-layer-163" data-node-id="519:34080" style={{ fontVariationSettings: '"wdth" 100' }}>
                      in
                    </p>
                    <div className="axm-fields-layer-179" data-node-id="519:34082" data-name="button">
                      <p className="axm-fields-layer-180" data-node-id="I519:34082;404:26617" style={{ fontVariationSettings: '"wdth" 100' }}>
                        2 locations
                      </p>
                    </div>
                  </div>
                </div>
                <div className="axm-fields-layer-181" data-node-id="519:34083">
                  <div className="axm-fields-layer-182" data-node-id="519:34084">
                    <div className="axm-fields-layer-183">
                      <img alt="" className="axm-fields-layer-52" src={imgFrame2147234900} />
                    </div>
                  </div>
                  <div className="axm-fields-layer-143" data-node-id="519:34086">
                    <div className="axm-fields-layer-174" data-node-id="519:34087" data-name="button">
                      <p className="axm-fields-layer-163" data-node-id="I519:34087;404:26617" style={{ fontVariationSettings: '"wdth" 100' }}>
                        Add more
                      </p>
                      <div className="axm-fields-layer-145" data-node-id="I519:34087;404:26618" data-name="addSmall">
                        <img alt="" className="axm-fields-layer-6" src={imgAddSmall} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="axm-fields-layer-184" data-node-id="519:34092" data-name="divider">
            <div className="axm-fields-layer-150" data-node-id="I519:34092;1:3399" data-name="separator" />
          </div>
          <div className="axm-fields-layer-185" data-node-id="519:34093">
            <div className="axm-fields-layer-186" data-node-id="519:34094" data-name="checkbox item">
              <div className="axm-fields-layer-153" data-node-id="I519:34094;655:639" data-name="padding">
                <Checkbox className="axm-fields-layer-154" />
              </div>
              <p className="axm-fields-layer-187" data-node-id="I519:34094;102:908" style={{ fontVariationSettings: '"wdth" 100' }}>
                List Properties
              </p>
            </div>
            <div className="axm-fields-layer-188" data-node-id="519:34096">
              <p className="axm-fields-layer-189" data-node-id="519:34097" style={{ fontVariationSettings: '"wdth" 100' }}>
                Use this field to track information about Lists at the Folder or Space level.
              </p>
            </div>
          </div>
          <div className="axm-fields-layer-184" data-node-id="519:34098" data-name="divider">
            <div className="axm-fields-layer-150" data-node-id="I519:34098;1:3399" data-name="separator" />
          </div>
          <div className="axm-fields-layer-151" data-node-id="519:34099">
            <div className="axm-fields-layer-186" data-node-id="519:34100" data-name="checkbox item">
              <div className="axm-fields-layer-153" data-node-id="I519:34100;655:639" data-name="padding">
                <Checkbox className="axm-fields-layer-154" />
              </div>
              <p className="axm-fields-layer-187" data-node-id="I519:34100;102:908" style={{ fontVariationSettings: '"wdth" 100' }}>
                People Properties
              </p>
            </div>
            <div className="axm-fields-layer-188" data-node-id="519:34102">
              <p className="axm-fields-layer-189" data-node-id="519:34103" style={{ fontVariationSettings: '"wdth" 100' }}>
                Add this field to view and track information on all user profile pages.
              </p>
            </div>
          </div>
          <div className="axm-fields-layer-149" data-node-id="519:34104" data-name="divider">
            <div className="axm-fields-layer-150" data-node-id="I519:34104;1:3399" data-name="separator" />
          </div>
          <div className="axm-fields-layer-190" data-node-id="519:34109" />
        </div>
        <div className="axm-fields-layer-191" data-node-id="519:34110">
          <div className="axm-fields-layer-192" data-node-id="519:34111" data-name="Card">
            <div className="axm-fields-layer-193" data-node-id="I519:34111;2674:21749" data-name="info">
              <div className="axm-fields-layer-194" data-node-id="I519:34111;2674:21750">
                <p className="axm-fields-layer-195" data-node-id="I519:34111;2674:21751" style={{ fontVariationSettings: '"wdth" 100' }}>
                  This field will be visible in:
                </p>
                <Tag className="axm-fields-layer-196" />
              </div>
              <ul className="axm-fields-layer-197" data-node-id="I519:34111;2674:21753" style={{ fontVariationSettings: '"wdth" 100' }}>
                <li className="axm-fields-layer-198">
                  <span className="axm-fields-layer-199">Bug tasks in Design Backlog.</span>
                </li>
                <li className="axm-fields-layer-200">
                  <span className="axm-fields-layer-199">Form Response tasks in Design Projects and Refinements.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="axm-fields-layer-201" data-node-id="519:34112">
          <div className="axm-fields-layer-202" data-node-id="519:34113" data-name="menu-divider">
            <div className="axm-fields-layer-203" data-node-id="I519:34113;703:687" data-name="separator" />
          </div>
          <div className="axm-fields-layer-204" data-node-id="519:34114">
            <div className="axm-fields-layer-205" data-node-id="519:34115">
              <div className="axm-fields-layer-206" data-node-id="519:34116" data-name="button">
                <p className="axm-fields-layer-207" data-node-id="I519:34116;404:26605" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Cancel
                </p>
              </div>
              <div className="axm-fields-layer-208" data-node-id="519:34117" data-name="button">
                <p className="axm-fields-layer-209" data-node-id="I519:34117;567:2657" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Save
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="axm-fields-layer-210" data-node-id="519:34118">
        <div className="axm-fields-layer-211">
          <div className="axm-fields-layer-212">
            <div className="axm-fields-layer-213">
              <img alt="" className="axm-fields-layer-52" src={imgVector405} />
            </div>
          </div>
        </div>
      </div>
      <p className="axm-fields-layer-214" data-node-id="519:34119">
        Section to summarize user decisions on field visibility.
      </p>
      <div className="axm-fields-layer-215" data-node-id="521:9389" />
      <div className="axm-fields-layer-216" data-node-id="521:12255" data-name="Select CF Type">
        <div className="axm-fields-layer-217" data-node-id="521:12256">
          <div className="axm-fields-layer-143" data-node-id="521:12257">
            <div className="axm-fields-layer-144" data-node-id="521:12258" data-name="button">
              <div className="axm-fields-layer-145" data-node-id="I521:12258;404:26620" data-name="arrowLeft">
                <img alt="" className="axm-fields-layer-6" src={imgArrowLeft} />
              </div>
            </div>
            <div className="axm-fields-layer-146" data-node-id="521:12259" data-name="button">
              <p className="axm-fields-layer-147" data-node-id="521:12260" style={{ fontVariationSettings: '"wdth" 100' }}>
                Available on
              </p>
            </div>
          </div>
        </div>
        <div className="axm-fields-layer-218" data-node-id="521:12263">
          <div className="axm-fields-layer-149" data-node-id="521:12264" data-name="divider">
            <div className="axm-fields-layer-150" data-node-id="I521:12264;1:3399" data-name="separator" />
          </div>
          <div className="axm-fields-layer-219" data-node-id="521:12265" data-name="🟢V3 Field Availability Settings">
            <div className="axm-fields-layer-159" data-node-id="I521:12265;1661:151242" data-name="Container">
              <button className="axm-fields-layer-220" data-node-id="I521:12265;1661:151243" data-name="Container">
                <div className="axm-fields-layer-159" data-node-id="I521:12265;1661:151244" data-name="Container">
                  <div className="axm-fields-layer-160" data-node-id="I521:12265;1661:151245" data-name="Container">
                    <div className="axm-fields-layer-161" data-node-id="I521:12265;1661:151246" data-name="radio item">
                      <Radio className="axm-fields-layer-221" />
                      <p className="axm-fields-layer-222" data-node-id="I521:12265;1661:151246;3:2192" style={{ fontVariationSettings: '"wdth" 100' }}>
                        All tasks in
                      </p>
                    </div>
                    <div className="axm-fields-layer-174" data-node-id="I521:12265;1661:151247" data-name="button">
                      <div className="axm-fields-layer-145" data-node-id="I521:12265;1661:151247;404:26636" data-name="sidebarList">
                        <img alt="" className="axm-fields-layer-6" src={imgSidebarList} />
                      </div>
                      <p className="axm-fields-layer-223" data-node-id="I521:12265;1661:151247;404:26637" style={{ fontVariationSettings: '"wdth" 100' }}>
                        Design backlog
                      </p>
                    </div>
                  </div>
                </div>
              </button>
              <div className="axm-fields-layer-159" data-node-id="I521:12265;1661:151248" data-name="Container">
                <div className="axm-fields-layer-166" data-node-id="I521:12265;1661:151249" data-name="Container">
                  <div className="axm-fields-layer-160" data-node-id="I521:12265;1661:151250" data-name="Container">
                    <div className="axm-fields-layer-167" data-node-id="I521:12265;1661:151251" data-name="radio item">
                      <Radio className="axm-fields-layer-168" selected />
                      <p className="axm-fields-layer-169" data-node-id="I521:12265;1661:151251;3:2214" style={{ fontVariationSettings: '"wdth" 100' }}>
                        Specific types of tasks
                      </p>
                    </div>
                  </div>
                </div>
                <div className="axm-fields-layer-170" data-node-id="I521:12265;1661:151253" data-name="Container">
                  <div className="axm-fields-layer-171" data-node-id="I521:12265;1661:151254" data-name="Icon Wrapper">
                    <div className="axm-fields-layer-172" data-node-id="I521:12265;1661:151255">
                      <div className="axm-fields-layer-173">
                        <img alt="" className="axm-fields-layer-52" src={imgVector1} />
                      </div>
                    </div>
                  </div>
                  <div className="axm-fields-layer-143" data-node-id="I521:12265;1661:151256" data-name="Container">
                    <div className="axm-fields-layer-174" data-node-id="I521:12265;1661:151257" data-name="button">
                      <p className="axm-fields-layer-224" data-node-id="I521:12265;1661:151257;404:26605" style={{ fontVariationSettings: '"wdth" 100' }}>
                        Bugs
                      </p>
                    </div>
                    <p className="axm-fields-layer-225" data-node-id="I521:12265;1661:151258" style={{ fontVariationSettings: '"wdth" 100' }}>
                      in
                    </p>
                    <div className="axm-fields-layer-174" data-node-id="I521:12265;1661:151260" data-name="button">
                      <p className="axm-fields-layer-226" data-node-id="I521:12265;1661:151260;404:26605" style={{ fontVariationSettings: '"wdth" 100' }}>
                        all locations
                      </p>
                    </div>
                  </div>
                </div>
                <div className="axm-fields-layer-181" data-node-id="I521:12265;1661:151269" data-name="Container">
                  <div className="axm-fields-layer-227" data-node-id="I521:12265;1661:151270" data-name="Icon Wrapper">
                    <div className="axm-fields-layer-228">
                      <img alt="" className="axm-fields-layer-52" src={imgIconWrapper} />
                    </div>
                  </div>
                  <div className="axm-fields-layer-174" data-node-id="I521:12265;1661:151272" data-name="button">
                    <p className="axm-fields-layer-225" data-node-id="I521:12265;1661:151272;404:26617" style={{ fontVariationSettings: '"wdth" 100' }}>
                      Add more
                    </p>
                    <div className="axm-fields-layer-145" data-node-id="I521:12265;1661:151272;404:26618" data-name="addSmall">
                      <img alt="" className="axm-fields-layer-6" src={imgAddSmall1} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="axm-fields-layer-201" data-node-id="521:12269">
          <div className="axm-fields-layer-202" data-node-id="521:12270" data-name="menu-divider">
            <div className="axm-fields-layer-203" data-node-id="I521:12270;703:687" data-name="separator" />
          </div>
          <div className="axm-fields-layer-204" data-node-id="521:12271">
            <div className="axm-fields-layer-205" data-node-id="521:12272">
              <div className="axm-fields-layer-208" data-node-id="521:12274" data-name="button">
                <p className="axm-fields-layer-209" data-node-id="I521:12274;567:2657" style={{ fontVariationSettings: '"wdth" 100' }}>
                  Save
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="axm-fields-layer-229" data-node-id="521:9936">
        <p className="axm-fields-layer-230">A few iterations later:</p>
        <ul className="axm-fields-layer-231">
          <li className="axm-fields-layer-232">
            <span className="axm-fields-layer-233">only show the option on the contextual entry point (not all three)</span>
          </li>
          <li className="axm-fields-layer-234">
            <span className="axm-fields-layer-233">converting a field should be in the custom field manager - an admin surface area</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
