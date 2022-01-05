import fs from 'node:fs'
import util from 'node:util'
import bless from 'neo-blessed'
import 'colors'

class LogFormatter{
	values = []
	extra = {}
	inspect = (ths)=>{return util.format(ths.extra)}
	formatShort = (...v)=>{return 'short'}
	formatLong = (...v)=>{return 'longer'}
	constructor(overrides){
		for (const key in overrides) {
			if (Object.hasOwnProperty.call(overrides, key)) {
				if ((typeof(this[key]) == typeof[overrides[key]])&&(this[key] == undefined)){}else{
				this[key] = overrides[key]
			}}
		}
	}
}

class Logger{
	useFile = false
	fileName = 'log.json'
	replEnabled = false
	_Messages = []
	_Formatters = {}
	_Long = false
	constructor(opt){
		if (typeof(opt.File) == 'string'){
			this.useFile = true,
			this.fileName = opt.File
		}
		if (typeof(opt.DefaultMessages) == 'object'){
			let object = opt.DefaultMessages
			let o = {}
			for (const key in object) {
				if (Object.hasOwnProperty.call(object, key)) {
					const element = object[key];
					if (element instanceof LogFormatter){
						o[key] = element
					}
				}
			}
			this._Formatters = o
		}
		if (opt.useLong) {
			this._Long = true
		}
		if (opt.createREPL) {
			this.startREPL()
		}
	}
	_print(text){
		if (this.replEnabled){
			let lines = text.split('\n')
			for (let i = 0; i < lines.length; i++) {
				this._term.addItem(lines[i])
			}
			this._scr.render()
		}else{
			console.log(log)
		}
	}
	get messageTypes() {return Object.keys(this._Formatters)}
	get messageCount() {return this._Messages.length}
	logMessage(messageType,values,extra){
		if (this._Formatters[messageType] == undefined){
			throw new ReferenceError(`no messageType ${messageType}`)
		}
		values.unshift(this._Messages.length)
		const m = {
			'type': messageType,
			'values': values,
		    'extra': extra
		}
		let form = this._Formatters[messageType]
		let log = (this._Long)? form.formatLong(...values):form.formatShort(...values)
		this._print(log)
		this._Messages.push(m)
		if(this.useFile){fs.writeFile(this.fileName,JSON.stringify(this._Messages),()=>{})}
	}
	shortMessage(messageNO){
		const mg = this._Messages[messageNO]
		if (mg != undefined){
			return this._Formatters[mg.type].formatShort(...mg.values)
		}
	}
	longMessage(messageNO){
		const mg = this._Messages[messageNO]
		if (mg != undefined){
			return this._Formatters[mg.type].formatLong(...mg.values)
		}
	}
	inspectMessage(messageNO){
		const mg = this._Messages[messageNO]
		if (mg != undefined){
			return this._Formatters[mg.type].inspect(mg)
		}
	}
	loadMessages(arr){
		if (arr instanceof Array)
		this._Messages = arr
	}
	parseCommand(command){
		if (!(this.replEnabled)){return}
		let split = command.split(' ')
		switch (split[0]) {
			case 'inspect':
					let inspect = this.inspectMessage(parseInt(split[1]))
					this._print(inspect)
				break;
			case 'short':
				let short = this.shortMessage(parseInt(split[1]))
				this._print(short)
			break;
			case 'long':
				let short = this.longMessage(parseInt(split[1]))
				this._print(short)
			break;
			case 'clear':
				this._term.clearItems()
				this._scr.render()
			break;
			default:
				this._print('Invalid Command'.red)
			break;
		}

	}
	startREPL(){
		this._scr = bless.screen({
    		'smartCSR': true,
    		'title': 'WorldQL Proxy'
		})

		this._term = bless.list({
    		'align': 'left',
    		'mouse': true,
	    	'keys':  true,
    		'width': '100%',
    		'height': '90%',
	    	'top': 0,
    		'left':0,
    		'scrollbar': {
    	    	'ch': '#',
	    	    'inverse': true
    		},
    		'items': []
		})

		this._input = bless.textarea({
    		'bottom':0,
	    	'height': '10%',
	    	'inputOnFocus': true,
		    'padding': {
    		    'top': 1,
        		'left': 2
		    },
    		style: {
        		fg: '#787878',
	        	bg: '#454545',
	    	    focus: {
    	    		fg: '#f6f6f6',
	    	    	bg: '#353535',
    			},
    		}
		})

		let ths = this

		this._input.key('enter', async function() {
	    	var message = this.getValue();
		    try {
		        ths.parseCommand(message)
		    } catch (err) {
		      // error handling
		    } finally {
   		 	    this.clearValue();
	    	    ths._scr.render();
    		}
		});

		this._scr.key(['escape', 'q', 'C-c'], function() {
		    return process.exit(0)
		});
		this._scr.append(this._term)
		this._scr.append(this._input)
		this._input.focus()
		this._scr.render()
		this.replEnabled = true
	}
}

const def = {
	LogFormatter: LogFormatter,
	Logger: Logger
}
export default def