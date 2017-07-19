/*
 * HTML5 GUI Framework for FreeSWITCH - XUI
 * Copyright (C) 2015-2017, Seven Du <dujinfang@x-y-t.cn>
 *
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is XUI - GUI for FreeSWITCH
 *
 * The Initial Developer of the Original Code is
 * Seven Du <dujinfang@x-y-t.cn>
 * Portions created by the Initial Developer are Copyright (C)
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Seven Du <dujinfang@x-y-t.cn>
 *
 *
 */

'use strict';

import React from 'react';
import T from 'i18n-react';
import { Modal, ButtonToolbar, ButtonGroup, Button, Form, FormGroup, FormControl, ControlLabel, Checkbox, Row, Col, Radio, Nav, NavItem, DropdownButton, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router';
import { EditControl, xFetchJSON } from './libs/xtools';
import _ from 'lodash';
import Dropzone from 'react-dropzone';

class NewTicket extends React.Component {
	constructor(props) {
		super(props);
		this.state = {errmsg: '', types: [], tel: null, textareaValue: '', subjectValue: ''};

		// This binding is necessary to make `this` work in the callback
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(e) {
		this.setState({tel: e.target.value});
	}

	handleSubmit(e) {
		var _this = this;

		console.log("submit...");
		var ticket = form2json('#newTicketForm');
		console.log("ticket", ticket);

		if (!ticket.cid_number || !ticket.subject) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		var _window = window;
		xFetchJSON("/api/tickets", {
			method:"POST",
			body: JSON.stringify(ticket)
		}).then((obj) => {
			const w= _window.open('/#/tickets/' + obj.id);
			_this.props.handleNewTicketAdded(obj);
		}).catch((msg) => {
			console.error("ticket", msg);
			_this.setState({errmsg: '' + msg + ''});
		});
	}

	componentWillMount() {
		var _this = this;
		const username = localStorage.getItem('xui.username');
		xFetchJSON("/api/users/cur_user/" + username).then((data) => {
			_this.setState({tel: data.tel});
		});
	}

	componentDidMount() {
		const _this = this;
		xFetchJSON("/api/dicts?realm=TICKET_TYPE").then((data) => {
			_this.setState({types: data});
		});
	}

	handleSelect(selectedKey) {
		let templates = [['用户举报', '时间：\n地点：\n事件：'], ['网站留言投诉', '投诉内容：'], ['来人来访', '时间：\n来人：']];
		this.setState({subjectValue: templates[selectedKey - 1][0]});
		this.setState({textareaValue: templates[selectedKey - 1][1]});
	}

	TextareaChange(event) {
		this.setState({textareaValue: event.target.value});
	}

	SubjectChange(event) {
		this.setState({subjectValue: event.target.value});
	}

	render() {
		console.log(this.props);

		const props = Object.assign({}, this.props);
		delete props.handleNewTicketAdded;
		const emergencys = ['NORMAL', 'EMERGENT', 'URGENT'];

		return <Modal {...props} aria-labelledby="contained-modal-title-lg">
			<Modal.Header closeButton>
				<Modal.Title id="contained-modal-title-lg"><T.span text="Create New Ticket" /></Modal.Title>
			</Modal.Header>
			<Modal.Body>
			<Form horizontal id="newTicketForm">
				<FormGroup controlId="formCIDNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="cid_number" value={this.state.tel} onChange={this.handleChange}/></Col>
				</FormGroup>
				<FormGroup controlId="formSubject">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Subject" className="mandatory"/></Col>
					<Col sm={10}><FormControl type="input" name="subject" placeholder="" value={this.state.subjectValue} onChange={this.SubjectChange.bind(this)} /></Col>
				</FormGroup>
				<FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>

					<Col sm={10}>
						<FormControl componentClass="select" name="type">
							{this.state.types.map(function(t) {
								return <option key={t.id} value={t.k}>{T.translate(t.v)}</option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>
				<FormGroup controlId="formEmergency">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Emergency"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="emergency">
							{emergencys.map(function(t) {
								return <option key={t} value={t}>{T.translate(t)}</option>;
							})}
						</FormControl>
					</Col>
				</FormGroup>
				<FormGroup controlId="formDeadline">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Deadline"/></Col>
					<Col sm={10}><FormControl type="date" name="completed_epoch"/></Col>
				</FormGroup>
				<FormGroup controlId="formContent">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Content"/></Col>
					<Col sm={10}><FormControl componentClass="textarea" rows="5" name="content" placeholder="" value={this.state.textareaValue} onChange={this.TextareaChange.bind(this)}/></Col>
				</FormGroup>
				<FormGroup>
					<Col smOffset={2} sm={2}>
						<Button type="button" bsStyle="primary" onClick={this.handleSubmit}>
							<i className="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;
							<T.span text="Save" />
						</Button>
						&nbsp;&nbsp;<T.span className="danger" text={this.state.errmsg}/>
					</Col>
					<Col smOffset={5} sm={2}>
						<DropdownButton bsStyle='primary' title={T.translate("Ticket Templates")} key='1' id='dropdown' onSelect={this.handleSelect.bind(this)}>
							<MenuItem eventKey="1">模版1</MenuItem>
							<MenuItem eventKey="2">模版2</MenuItem>
							<MenuItem eventKey="3">模版3</MenuItem>
						</DropdownButton>
					</Col>
				</FormGroup>
			</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={this.props.onHide}>
					<i className="fa fa-times" aria-hidden="true"></i>&nbsp;
					<T.span text="Close" />
				</Button>
			</Modal.Footer>
		</Modal>;
	}
}

class TicketPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			ticket: {},
			users: [],
			user_options: null,
			ticket_comments: [],
			deal_user: null,
			edit: false,
			types: [],
			call: "回拨",
			content: false,
			appraise: '',
			record_src: '',
			media_files: [],
			comment: '',
			hiddendiv: 'none'
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleCommit = this.handleCommit.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleSubmitChange = this.handleSubmitChange.bind(this);
		this.handleControlClose = this.handleControlClose.bind(this);
		this.handleClickChange = this.handleClickChange.bind(this);
		this.handleSatisfiedSubmit = this.handleSatisfiedSubmit.bind(this);
		this.handleAppraiseSubmit = this.handleAppraiseSubmit.bind(this);
		this.handleDownload = this.handleDownload.bind(this);
		this.onDrop = this.onDrop.bind(this);
		this.handleCommitUpload = this.handleCommitUpload.bind(this);
	}

	handleCommitUpload() {
		this.dropzone.open();
	}

	exportCsv(obj) {
		var title = obj.title;
		var titleForKey = obj.titleForKey;
		var data = obj.data;
		var str = [];
		str.push(obj.title.join(",") + "\n");
		for (var i = 0; i < data.length; i++) {
			var temp = [];
			for (var j = 0; j < titleForKey.length; j++) {
				temp.push(data[i][titleForKey[j]]);
			}
			str.push(temp.join(":") + "  ");
		}
		var uri = 'data:text/plain;charset=uft8,' + encodeURIComponent(str.join(""));
		var downloadLink = document.createElement("a");
		downloadLink.href = uri;
		downloadLink.download = this.state.ticket.subject + ".txt";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}

	handleDownload() {
		const ticket = this.state.ticket;
		this.exportCsv({
			title: ["工单内容", this.state.ticket.subject],
			titleForKey: ["num1", "num2"],
			data: [
				{
					num1: "主题",
					num2: ticket.subject
				}, {
					num1: "主叫号码",
					num2: ticket.cid_number
				}, {
					num1: "创建时间",
					num2: ticket.created_epoch
				}, {
					num1: "内容",
					num2: ticket.content
				}, {
					num1: "类型",
					num2: T.translate(ticket.type)
				}, {
					num1: "状态",
					num2: T.translate(ticket.status)
				}, {
					num1: "紧急程度",
					num2: T.translate(ticket.emergency)
				}, {
					num1: "处理期限",
					num2: ticket.deadline
				}, {
					num1: "派单人",
					num2: ticket.user_name
				}]
		});
	}

	handleSatisfiedSubmit(e) {
		var _this = this;
		var satisfied = form2json('#SatisfiedForm');

		xFetchJSON("/api/tickets/" + this.state.ticket.id + "/satisfied", {
			method: "PUT",
			body: JSON.stringify(satisfied)
		}).then((obj) => {
			console.log('submit successfully')
		}).catch((err) => {
			console.error("satisfied", err);
			notify(err, "error");
		});
		xFetchJSON("/api/tickets/" + _this.props.params.id).then((data) => {
			console.log("ticket", data);
			_this.setState({ticket: data});
		}).catch((e) => {
			console.error("get ticket", e);
		});
	}

	handleClickChange(e) {
		const users = this.state.users;
		const ticket = this.state.ticket;
		delete ticket.current_user_id;
		let deal_user = <FormControl componentClass="select" name="current_user_id">{
				users.map(function(row) {
					return <option key={row.id} value={row.id}>{row.name} ({row.extn}) {row.nickname}</option>
				})
			}
		</FormControl>;
		this.setState({deal_user: deal_user});
	}

	handleControlClose () {
		let _this = this;
		let ticket = this.state.ticket;
		console.log('ticket', ticket)
		let id = this.state.ticket.id;
		xFetchJSON("/api/tickets/" + id  + "/close", {
			method: "PUT"
		}).then(() => {
			ticket.status = "TICKET_ST_DONE";
			_this.setState({ticket: ticket});
			notify(<T.span text={{key:"Finished at", time: Date()}}/>);
		}).catch((msg) => {
			console.error("ticket", msg);
		});
	} 

	handleSubmit(e) {
		var _this = this;
		var ticket = form2json('#ticketAssignForm');
		var username;
		_this.state.users.map((user) => {
			if (user.id == ticket.current_user_id) {
				username = user.name;
			}
		})
		xFetchJSON("/api/tickets/" + this.state.ticket.id + "/assign/" + ticket.current_user_id, {
			method: "PUT",
			body: JSON.stringify(ticket)
		}).then(() => {
			console.log('assign successfully');
			notify(<T.span text={{key:"Assigned to", username: username}}/>);
		}).catch((err) => {
			console.error("ticket", err);
			notify(err, "error");
		});
	}

	handleCommit(e) {
		var _this = this;
		var ticket = {content: this.state.comment};

		xFetchJSON("/api/tickets/" + this.state.ticket.id + "/comments", {
			method: "POST",
			body: JSON.stringify(ticket)
		}).then((obj) => {
			var rows = this.state.ticket_comments;
			rows.unshift(obj);
			this.setState({ticket_comments: rows, deal_user: null, hidden_user: null, comment: ''});
		}).catch((err) => {
			console.error("ticket", err);
			notify(err, "error");
		});
	}

	handleAppraiseSubmit(e) {
		var _this = this;
		var ticket = form2json('#FormAppraise');

		xFetchJSON("/api/tickets/" + this.state.ticket.id + "/appraise", {
			method: "PUT",
			body: JSON.stringify(ticket)
		}).then((data) => {
			console.log('data', data);
			_this.setState({appraise: data.appraise, content: true});
		}).catch((err) => {
			console.error("ticket", err);
			notify(err, "error");
		});
	}

	handleSubmitChange(e) {
		var _this = this;

		console.log("submit...");
		var ticket = form2json('#ticketForm');
		console.log("ticket", ticket);

		if (!ticket.cid_number || !ticket.subject) {
			this.setState({errmsg: "Mandatory fields left blank"});
			return;
		}

		xFetchJSON("/api/tickets/" + ticket.id, {
			method: "PUT",
			body: JSON.stringify(ticket)
		}).then((data) => {
			_this.setState({ticket: ticket, errmsg: {key: "Saved at", time: Date()}, edit: !_this.state.edit});
		}).catch((msg) => {
			console.error("ticket", msg);
		});
	}

	handleControlClick(e) {
		this.setState({edit: !this.state.edit});
	}

	componentDidMount() {
		var _this = this;
		xFetchJSON("/api/tickets/" + _this.props.params.id).then((data) => {
			console.log("ticket", data);
			_this.setState({ticket: data});
			xFetchJSON("/api/tickets/" + _this.props.params.id + '/record?file_id=' + _this.state.ticket.media_file_id).then((data) => {
				this.setState({record_src: data.rel_path});
			});
		}).catch((e) => {
			console.error("get ticket", e);
		});

		xFetchJSON("/api/users/bind").then((data) => {
			this.setState({users: data});
		});

		xFetchJSON("/api/tickets/" + _this.props.params.id + '/comments').then((data) => {
			console.log('data', data)
			this.setState({ticket_comments: data});
		});

		xFetchJSON("/api/dicts?realm=TICKET_TYPE").then((data) => {
			_this.setState({types: data});
		});

		xFetchJSON("/api/tickets/" + _this.props.params.id + "/comments/media_files").then((media_files) => {
			console.log("media_files", media_files);
			_this.setState({media_files: media_files});
		})
	}

	callBack(e) {
		this.setState({call: "回拨中..."});
		xFetchJSON('/api/call_back/' + e).then((data) => {
			this.setState({call: "回拨"});
		});
	}

	onDrop(acceptedFiles, rejectedFiles) {
		const _this = this;

		console.log('Accepted files: ', acceptedFiles);
		console.log('Rejected files: ', rejectedFiles);

		if (this.state.readonly) return;

		const formdataSupported = !!window.FormData;

		let data = new FormData()

		for (var i = 0; i < acceptedFiles.length; i++) {
			data.append('file', acceptedFiles[i])
		}

		let xhr = new XMLHttpRequest();
		const progressSupported = "upload" in xhr;

		xhr.onload = function(e) {
			_this.setState({progress: 100});
			_this.setState({progress: -1});
		};

		if (progressSupported) {
			xhr.upload.onprogress = function (e) {
				// console.log("event", e);
				if (event.lengthComputable) {
					let progress = (event.loaded / event.total * 100 | 0);
					// console.log("complete", progress);
					_this.setState({progress: progress});
				}
			}
		} else {
			console.log("XHR upload progress is not supported in your browswer!");
		}

		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					// console.log('response=',xhr.responseText);
					let mfiles = JSON.parse(xhr.responseText);
					console.log(mfiles);
					_this.setState({rows: mfiles.concat(_this.state.rows)});
				} else {
					// console.error("upload err");
				}
			}
		}

		xhr.open('POST', '/api/tickets/' + _this.props.params.id + '/comment_upload');
		xhr.send(data);
	}

	HandleChangeComment(event) {
		this.setState({comment: event.target.value});
	}

	handleMore(e) {
		e.preventDefault();
		this.setState({hiddendiv: this.state.hiddendiv == 'none' ? 'block' : 'none'});
	}
	render() {
		const idArray = this.state.media_files.map((m) => {
			return m.comment_id;
		})
		let _this = this;
		let savebtn = "";
		if (this.state.edit) {
			savebtn = <Button onClick={this.handleSubmitChange}><i className="fa fa-save" aria-hidden="true"></i>&nbsp;<T.span text="Save"/></Button>
		}

		const ticket_comments = this.state.ticket_comments.map(function(row) {
			if (row.avatar_url) {
				var src = row.avatar_url;
			} else {
				var src = "/assets/img/default_avatar.png";
			}
			var vasrc = '';

			_this.state.media_files.map((m) => {
				if(m.comment_id == row.id){
					vasrc = "/upload/" + m.src;
				}
			})
			var va;
			if ( vasrc.slice(-3) == 'mp4' ) {
				va = <video src={vasrc} controls="controls" style={{maxWidth: "80%", maxHeight: "200px"}}/>;
			}else if ( vasrc.slice(-3) == 'amr' ) {
				va = <audio src={vasrc.slice(0, -3) + 'mp3'} controls="controls"></audio>;
			}else if ( vasrc.slice(-3) == 'png' || vasrc.slice(-3) == 'jpg' ) {
				va = <img src={vasrc} style={{maxWidth: "80%", maxHeight: "200px"}}/>
			}
		    var content =  _.indexOf(idArray, row.id) != -1 ? va : <p>{row.content}</p>;
			let style = {width: '40px'};
			return <Row key={row.id}>
				<Col componentClass={ControlLabel} sm={1} smOffset={2}><img src={src} style={style}/></Col>
				<Col sm={6}> <strong>{row.user_name}</strong>&nbsp;<small>{row.created_epoch}</small>
					<br/><br/>{content}
				</Col>
			</Row>
		})

		const ticket = this.state.ticket;
		if (ticket.appraise || this.state.appraise) {
			this.state.content = true;
		}
		let types = {};
		this.state.types.forEach((type) => {
			types[type.k] = type.v;
		})
		var status = '';
		var style = null;
		if(ticket.status == "TICKET_ST_NEW"){
			style = {color: 'red'};
		}
		if(ticket.status == 'TICKET_ST_DONE'){
			style = {color: 'green'};
		}

		let save_btn = "";
		let commit_btn = "";
		let hidden_user = "";
		const users = this.state.users;
		let deal_user = <FormControl componentClass="select" name="current_user_id">{
				users.map(function(row) {
					return <option key={row.id} value={row.id}>{row.name} ({row.extn}) {row.nickname}</option>
				})
			}
		</FormControl>;
		if(ticket.current_user_id){
			users.map(function(row) {
				if(row.id == ticket.current_user_id){
					deal_user = <FormControl.Static><T.span text={row.name} onClick={_this.handleClickChange}/></FormControl.Static>
					hidden_user = <FormControl type="hidden" name="current_user_id" value={row.id}/>
				}
			})
		}

		this.state.deal_user = deal_user;
		this.state.hidden_user = hidden_user;

		save_btn = <Button onClick={this.handleSubmit}><T.span text="Assign"/></Button>
		commit_btn = <Button onClick={this.handleCommit}><T.span text="Comment"/></Button>
		const upload_btn = <Button onClick={this.handleCommitUpload}><T.span text="Upload" /></Button>

		const options = <FormGroup>
			<Col componentClass={ControlLabel} sm={2}><T.span text="处理人" /></Col>
			<Col sm={4}>
				{this.state.deal_user}
			</Col>
			<Col sm={2}>{save_btn}</Col>
		</FormGroup>;
		let Audio;
		if (_this.state.record_src) {
			const src = "/recordings/" + _this.state.record_src;
			Audio = <FormGroup controlId="formCaller_id_name">
						<Col componentClass={ControlLabel} sm={2}><T.span text="Record"/></Col>
						<Col sm={10}><audio src={src} controls="controls" /></Col>
					</FormGroup>
		} else {
			Audio = <div></div>;
		};
		let FORM;
		if (this.state.edit == false) {
			FORM = <FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="type" defaultValue={types[ticket.type]}/></Col>
				</FormGroup>;
		} else {
			FORM = <FormGroup controlId="formType">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Type"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="type">
							{this.state.types.map(function(t) {
								if (t.v == ticket.type) {
									return <option key={t.id} value={t.k} selected="selected">{T.translate(t.v)}</option>;
								} else {
									return <option key={t.id} value={t.k}>{T.translate(t.v)}</option>;
								};
							})}
						</FormControl>
					</Col>
				</FormGroup>;
		};
		const emergencys = ['URGENT', 'EMERGENT', 'NORMAL'];
		let EMERGENRY;
		if (this.state.edit == false) {
			EMERGENRY = <FormGroup controlId="formEmergency">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Emergency"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="emergency" defaultValue={ticket.emergency}/></Col>
				</FormGroup>;
		} else {
			EMERGENRY = <FormGroup controlId="formEmergency">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Emergency"/></Col>
					<Col sm={10}>
						<FormControl componentClass="select" name="emergency">
							{emergencys.map(function(t) {
								if (t == ticket.type) {
									return <option key={t} value={t} defaultValue={T.translate(t)}>{T.translate(t)}</option>;
								} else {
									return <option key={t} value={t}>{T.translate(t)}</option>;
								};
							})}
						</FormControl>
					</Col>
				</FormGroup>;
		};
		let satisfied;
		switch(_this.state.ticket.satisfied){
			case undefined:
			case null:
			case '': satisfied = <Form horizontal id="SatisfiedForm">
									<FormGroup>
										<Col componentClass={ControlLabel} sm={2}><T.span text="满意度" /></Col>
										<Col sm={3}>
											<span>
												<Radio name="satisfied" value="1" inline defaultChecked><T.span text="Satisfied"/></Radio>
												<Radio name="satisfied" value="0" inline><T.span text="Unsatisfied"/></Radio>
											</span>
										</Col>
										<Col sm={2}>
											<Button onClick={this.handleSatisfiedSubmit}><T.span onClick={this.handleSatisfiedSubmit} text="Submit"/></Button>
										</Col>
									</FormGroup>
								</Form>;
								break;
			case '1': satisfied = <Form horizontal id="SatisfiedForm">
									<FormGroup>
										<Col componentClass={ControlLabel} sm={2}><T.span text="满意度" /></Col>
										<Col sm={3}>
											<span>
												<T.span text="Satisfied"/>
											</span>
										</Col>
									</FormGroup>
								</Form>;
								break;
			case '0': satisfied = <Form horizontal id="SatisfiedForm">
									<FormGroup>
										<Col componentClass={ControlLabel} sm={2}><T.span text="满意度" /></Col>
										<Col sm={3}>
											<span>
												<T.span text="Unsatisfied"/>
											</span>
										</Col>
									</FormGroup>
								</Form>;
								break;
		}
		return <Dropzone ref={(node) => { this.dropzone = node; }} onDrop={this.onDrop} className="dropzone" activeClassName="dropzone_active" disableClick={true}><div>
			<ButtonToolbar className="pull-right">
			<ButtonGroup>
				<Button onClick={this.handleMore.bind(this)}><i className="fa fa-comments" aria-hidden="true"></i>&nbsp;<T.span text="Ticket Appraise"/></Button>
			</ButtonGroup>
			<ButtonGroup>
				<Link to={`/tickets`} className="btn btn-default">
						<i className="fa fa-chevron-circle-left" aria-hidden="true"></i>&nbsp;<T.span text="Back"/>
				</Link>
				<Button onClick={this.handleDownload}><i className="fa fa-download" aria-hidden="true"></i>&nbsp;<T.span text="Download"/></Button>
			</ButtonGroup>
			<ButtonGroup>
				<Button onClick={() => _this.callBack(ticket.id)}><i className="fa fa-phone-square" aria-hidden="true"></i>&nbsp;<T.span text={_this.state.call}/></Button>
			</ButtonGroup>
			<ButtonGroup>
				<Button onClick={this.handleControlClose}><i className="fa fa-check-square" aria-hidden="true"></i>&nbsp;<T.span text="Finished"/></Button>
				{ savebtn }
				<Button onClick={this.handleControlClick}><i className="fa fa-edit" aria-hidden="true"></i>&nbsp;<T.span text="Edit"/></Button>
			</ButtonGroup>
			</ButtonToolbar>

			<h1><T.span text="工单"/> <small>{ticket.serial_number}</small></h1>
			<hr/>
			<div style={{display: this.state.hiddendiv}}>
				{satisfied}
				<Form horizontal id="FormAppraise">
					{
						this.state.content ?
						<FormGroup>
							<Col componentClass={ControlLabel} sm={2}><T.span text="工单评价" /></Col>
							<Col sm={4}>
								<EditControl componentClass="textarea" name="appraise" defaultValue={this.state.appraise ? this.state.appraise : this.state.ticket.appraise}/>						
							</Col>
						</FormGroup> :
						<FormGroup>
							<Col componentClass={ControlLabel} sm={2}><T.span text="工单评价" /></Col>
							<Col sm={3}>
								<FormControl componentClass="textarea" name="appraise" placeholder="评价内容" />
							</Col>
							<Col sm={1}>
								<Button onClick={this.handleAppraiseSubmit}><T.span onClick={this.handleAppraiseSubmit} text="Submit"/></Button>
							</Col>
						</FormGroup>
					}
				</Form>
				<hr/>
			</div>
			<Form horizontal id="ticketForm">
				<input type="hidden" name="id" defaultValue={ticket.id}/>
				<FormGroup controlId="formCIDNumber">
					<Col componentClass={ControlLabel} sm={2}><T.span text="CID Number" className="mandatory"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="cid_number" defaultValue={ticket.cid_number}/></Col>
				</FormGroup>

				<FormGroup controlId="formSubject">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Subject"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="subject" defaultValue={ticket.subject}/></Col>
				</FormGroup>

				<FormGroup controlId="formCreated_epoch">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Created At"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="created_epoch" defaultValue={ticket.created_epoch}/></Col>
				</FormGroup>

				<FormGroup controlId="formFinished_epoch">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Deadline"/></Col>
					<Col sm={10}><EditControl edit={this.state.edit} name="completed_epoch" defaultValue={ticket.completed_epoch}/></Col>
				</FormGroup>

				{FORM}

				<FormGroup controlId="formStatus">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Status"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={ticket.status} style={style}/></FormControl.Static></Col>
				</FormGroup>

				{EMERGENRY}

				<FormGroup controlId="formUser">
					<Col componentClass={ControlLabel} sm={2}><T.span text="派单人"/></Col>
					<Col sm={10}><FormControl.Static><T.span text={ticket.user_name}/></FormControl.Static></Col>
				</FormGroup>

				{Audio}

				<FormGroup controlId="formContent">
					<Col componentClass={ControlLabel} sm={2}><T.span text="Content"/></Col>
					<Col sm={8}><EditControl componentClass="textarea" edit={this.state.edit} name="content" defaultValue={ticket.content}/></Col>
				</FormGroup>
			</Form>

			<Form horizontal id="ticketAssignForm">
					{this.state.hidden_user}
					{options}
			</Form>
			<br/>
			<hr />
			<Form horizontal id="ticketProcessingForm">
				<FormGroup>
					<Col componentClass={ControlLabel} sm={2}><T.span text="内容"/></Col>
					<Col sm={8}>
						<FormControl componentClass="textarea" name="content" value={this.state.comment} onChange={this.HandleChangeComment.bind(this)} />
					</Col>
				</FormGroup>
				<FormGroup>
					<Col componentClass={ControlLabel} sm={2}></Col>
					<Col sm={2}>{commit_btn}</Col>
					<Col sm={2}>{upload_btn}</Col>
				</FormGroup>
			</Form>
			<hr />
			{ticket_comments}
		</div></Dropzone>
	}
}

class TicketsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {rows: [], danger: false, formShow: false, hiddendiv: 'none', loaded: false, activeKey: 0, types: [], display: 'inline'};
		this.handleDelete = this.handleDelete.bind(this);
		this.handleControlClick = this.handleControlClick.bind(this);
		this.handleQuery = this.handleQuery.bind(this);
		this.handleMore = this.handleMore.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
		this.handleDownload = this.handleDownload.bind(this);
	}

	handleMore (e) {
		e.preventDefault();
		this.setState({hiddendiv: this.state.hiddendiv == 'none' ? 'block' : 'none'});
	}

	handleDelete(e) {
		var id = e.target.getAttribute("data-id");
		var _this = this;
		if (!this.state.danger) {
			var c = confirm(T.translate("Confirm to Delete ?"));

			if (!c) return;
		}
		xFetchJSON("/api/tickets/" + id, {method: "DELETE"}).then(() => {
			console.log("deleted")
			var rows = _this.state.rows.filter(function(row) {
				return row.id != id;
			});

			this.setState({rows: rows});
		}).catch((msg) => {
			console.error("user", msg);
			notify(msg, 'error');
		});
	}
	componentWillMount () {
	}

	componentWillUnmount () {
	}

	componentDidMount () {
		var _this = this;
		xFetchJSON("/api/tickets").then((data) => {
			console.log('data', data)
			this.setState({rows: data, loaded: true});
		});

		xFetchJSON("/api/dicts?realm=TICKET_TYPE").then((data) => {
			_this.setState({types: data});
		});
	}

	handleTicketAdded(ticket) {
		var rows = this.state.rows;
		rows.unshift(ticket);
		this.setState({rows: rows, formShow: false});
	}

	handleControlClick(e) {
		var data = e.target.getAttribute("data");
		console.log("data", data);

		if (data == "new") {
			this.setState({ formShow: true});
		}
	}

	handleQuery (e) {
		var data = parseInt(e.target.getAttribute("data"));

		this.days = data;
		e.preventDefault();

		xFetchJSON("/api/tickets?last=" + data).then((tickets) => {
			this.setState({rows: tickets});
		})
	}

	handleSearch (e) {
		const qs = "startDate=" + this.startDate.value +
			"&endDate=" + this.endDate.value +
			"&id=" + this.id.value +
			"&cid_number=" + this.cid_number.value +
			"&status=" + this.status.value +
			"&serial_number=" + this.serial_number.value;
		console.log(qs);

		xFetchJSON("/api/tickets?" + qs).then((tickets) => {
			this.setState({
				rows: tickets
			});
		});
	}

	handleSelect(selectedKey) {
		let _this = this;

		if (selectedKey == 0) {
			xFetchJSON("/api/tickets").then((data) => {
				this.setState({rows: data, activeKey: selectedKey, display: 'inline'});
			});
		} else {
			xFetchJSON("/api/tickets/onetype?theType=" + selectedKey).then((data) => {
				_this.setState({rows: data, activeKey: selectedKey, display: 'none'});
			});
		}
	}

	handleDownload() {
		var uri = "/api/tickets/download";
		var downloadLink = document.createElement("a");
		downloadLink.href = uri;
		downloadLink.download = "tickets_download" + ".csv";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}

	render () {
		var _this = this;
		let hand = { cursor: "pointer"};
		var danger = this.state.danger ? "danger" : "";
		let formClose = () => this.setState({ formShow: false });
		var rows = _this.state.rows.map(function(row) {
			var status = '';
			var style = null;
			if(row.status == "TICKET_ST_NEW"){
				style = {color: 'red'};
			}
			if(row.status == 'TICKET_ST_DONE'){
				style = {color: 'green'};
			}
			return <tr key={row.id}>
				<td>{row.id}</td>
				<td>{row.serial_number}</td>
				<td>{row.cid_number}</td>
				<td>{row.subject}</td>
				<td>{row.created_epoch}</td>
				<td><T.span text={row.status} style={style}/></td>
				<td><Link to={`/tickets/${row.id}`}><T.span text="开始处理"/></Link> | <T.a style={hand} onClick={_this.handleDelete} data-id={row.id} text="Delete" className={danger}/></td>
			</tr>
		})
				var now = new Date();
		var nowdate = Date.parse(now);
		var sevenDaysBeforenowtime = nowdate - 7*24*60*60*1000;
		var sevenDaysBeforenowdate = new Date(sevenDaysBeforenowtime);

		function getTime(time){
			var month = (time.getMonth() + 1);
			var day = time.getDate();
			if (month < 10) 
				month = "0" + month;
			if (day < 10)
				day = "0" + day;
			return time.getFullYear() + '-' + month + '-' + day;
		}

		var today = getTime(now);
		var sevenDaysBeforeToday = getTime(sevenDaysBeforenowdate);

		let isShow;
		if(this.state.loaded){
			isShow = "none";
		}
		const loadSpinner = {
			width: "200px",
			height: "200px",
			margin: "auto", 
			clear: "both",
			display: "block",
			color: 'gray',
			display : isShow
		}

		return <div>
			<ButtonToolbar className="pull-right">
				<br/>
				<div style={{display: _this.state.display}}>
					<T.span text="Last"/> &nbsp;
					<T.a onClick={this.handleQuery} text={{key:"days", day: 7}} data="7" href="#"/>&nbsp;|&nbsp;
					<T.a onClick={this.handleQuery} text={{key:"days", day: 15}} data="15" href="#"/>&nbsp;|&nbsp;
					<T.a onClick={this.handleQuery} text={{key:"days", day: 30}} data="30" href="#"/>&nbsp;|&nbsp;
					<T.a onClick={this.handleQuery} text={{key:"days", day: 60}} data="60" href="#"/>&nbsp;|&nbsp;
					<T.a onClick={this.handleQuery} text={{key:"days", day: 90}} data="90" href="#"/>&nbsp;|&nbsp;
					<T.a onClick={this.handleMore} text="More" data="more" href="#"/>...
				</div>
				&nbsp;
				<Button onClick={this.handleDownload}>
					<i className="fa fa-download" aria-hidden="true"></i>&nbsp;
					<T.span text="Download" />
				</Button>&nbsp;
				<Button onClick={this.handleControlClick} data="new">
					<i className="fa fa-plus" aria-hidden="true" onClick={this.handleControlClick} data="new"></i>&nbsp;
					<T.span onClick={this.handleControlClick} data="new" text="New" />
				</Button>
			</ButtonToolbar>

			<h1 style={{float: "left"}}><T.span text="Tickets" />&nbsp;&nbsp;&nbsp;&nbsp;</h1>

			<br/>
			<Nav bsStyle="tabs" activeKey={this.state.activeKey} onSelect={this.handleSelect}>
				<NavItem eventKey={0}>全部</NavItem>
				{
					this.state.types.map((type) => {
						return <NavItem key={type.k} eventKey={type.k}>{type.v}</NavItem>
					})
				}
			</Nav>

			<div style={{padding: "5px", display: _this.state.hiddendiv}} className="pull-right">
				<input type="date" defaultValue={sevenDaysBeforeToday} ref={(input) => { _this.startDate = input; }}/> -&nbsp;
				<input type="date" defaultValue={today} ref={(input) => { _this.endDate = input; }}/> &nbsp;
				<T.span text="ID"/><input ref={(input) => { _this.id = input; }}/> &nbsp;
				<T.span text="Serial Number"/><input ref={(input) => { _this.serial_number = input; }}/> &nbsp;
				<T.span text="CID Number"/><input ref={(input) => { _this.cid_number = input; }}/> &nbsp;
				<T.span text="Status"/>
				<select ref={(input) => { _this.status = input; }}>
					<option value ="">{T.translate("ALL")}</option>
					<option value ="TICKET_ST_NEW">{T.translate("TICKET_ST_NEW")}</option>
					<option value ="TICKET_ST_PROCESSING">{T.translate("TICKET_ST_PROCESSING")}</option>
					<option value="TICKET_ST_DONE">{T.translate("TICKET_ST_DONE")}</option>
				</select>&nbsp;
				<T.button text="Search" onClick={this.handleSearch}/>
			</div>

			<table className="table">
				<tbody>
					<tr>
						<th><T.span text="ID"/></th>
						<th><T.span text="Serial Number"/></th>
						<th><T.span text="CID Number"/></th>
						<th><T.span text="Subject"/></th>
						<th><T.span text="Created At"/></th>
						<th><T.span text="Status"/></th>
						<th><T.span text="Action"/></th>
					</tr>
					{rows}
				</tbody>
			</table>
			<NewTicket show={this.state.formShow} onHide={formClose} handleNewTicketAdded={this.handleTicketAdded.bind(this)}/>
			<div style={{textAlign: "center"}}>
				<img style={loadSpinner} src="/assets/img/loading.gif"/>
			</div>
		</div>
	}
}

export {TicketPage, TicketsPage};
